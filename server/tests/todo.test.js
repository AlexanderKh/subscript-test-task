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
});