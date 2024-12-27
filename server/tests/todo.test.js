const {request, knex} = require('./util/setup.js');

const getBody = response => response.body;

describe('Todo-Backend API', () => {
    afterAll(async () => {
        await knex.destroy();
    })
    beforeEach(async () => {
        await knex.raw('start transaction')
    });
    afterEach(async () => {
        await knex.raw('rollback')
    });

    describe("The pre-requsites", () => {
        it("the api root responds to a GET", async () => {
                const response = await request.get('/todos');
                expect(response.status).toBe(200);
            }
        );

        it("the api root responds to a POST with the todo which was posted to it", async () => {
            const starting = {"title": "a todo"};
            const getRoot = await request.post('/todos', starting).then(getBody);
            expect(getRoot).toMatchObject(expect.objectContaining(starting));
        });
    });

    describe("User API", () => {
        beforeEach(async () => {
            const queryResult = await knex('organizations').insert({ name: 'TestCorp' }).returning('*');
            this.organization = queryResult[0];
        })


        it("creates a user on /register call", async () => {
            const response = await request.post('/users/register', {
                "username": "test_user",
                "password": "testtest1",
                "organization_name": this.organization.name
            });
            expect(response.status).toBe(201);
            const queryResult = await knex('users').where({ username: 'test_user' });
            expect(queryResult.length).toEqual(1);
            expect(queryResult[0].organization_id).toEqual(this.organization.id);
        });
        it("returns error if organization does not exist", async () => {
            const response = await request.post('/users/register', {
                "username": "test_user",
                "password": "testtest1",
                "organization_name": 'randomorg'
            });
            expect(response.status).toBe(400);
            const queryResult = await knex('users').where({ username: 'test_user' });
            expect(queryResult.length).toEqual(0);
        });
    });
});