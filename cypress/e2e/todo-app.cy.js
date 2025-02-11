// sets up autocompletion for cypress in vs code
/// <reference types="cypress" />

describe("todo app key functionalities", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("loads page & content", () => {
    cy.get("#list");
    cy.get("#filters li");
  });

  it("shows empty todo list on first start", () => {
    cy.get("#list li").should("have.length", 0);
  });

  it("adds a new todo", () => {
    let randomInput = Math.random() * 99999999;
    cy.get("#inp-new-todo").type(randomInput);
    cy.get("#btn-add-todo").click();
    cy.get("#list li").last().should("have.text", randomInput.toString());
    cy.get("#list li input[type=checkbox]").last().should("not.be.checked");
  });

  it("rejects duplicate todos", () => {
    let input = "Hello World";
    cy.get("#inp-new-todo").type(input);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(input);
    cy.get("#btn-add-todo").click();
    cy.get("#list li").should("have.length", 1);
    cy.get("#hint-duplicate").should("have.text", "Todo already exists.");
  });

  it("checks todo and marks as done", () => {
    let randomInput = Math.random() * 99999999;

    // add a new todo
    cy.get("#inp-new-todo").type(randomInput);
    cy.get("#btn-add-todo").click();

    // verify the new todo is added
    cy.get("#list li").last().should("have.text", randomInput.toString());

    // verify checkbox is NOT checked initially
    cy.get("#list li input[type=checkbox]").last().should("not.be.checked");

    // click the todo to mark as done
    cy.get("#list li label").last().click();

    // verify checkbox is now checked
    cy.get("#list li input[type=checkbox]").last().should("be.checked");

    // apply "done" filter
    cy.get("label[for=done]").click();

    // verify the filtered list still contains the added todo
    cy.get("#list li").last().should("have.text", randomInput.toString());

    // verify the checkbox is still checked after filtering
    cy.get("#list li input[type=checkbox]").last().should("be.checked");
  });

  it("removes done todos", () => {
    // add 3 new todos
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();

    // verify the new todo is added
    cy.get("#list li").should("have.length", 3);

    // verify all checkboxes are NOT checked initially
    cy.get("#list li input[type=checkbox]").should("not.be.checked");

    // click the first and last todo to mark as done
    cy.get("#list li label").first().click();
    cy.get("#list li label").last().click();

    // verify checkbox is now checked
    cy.get("#list li input[type=checkbox]").first().should("be.checked");
    cy.get("#list li input[type=checkbox]").last().should("be.checked");

    // click the "remove done todos" button
    cy.get("#btn-remove-done").click();

    // verify the done todos are removed from the list
    cy.get("#list li").should("have.length", 1);
    cy.get("#list li input[type=checkbox]").should("not.be.checked");

    // apply "done" filter
    cy.get("label[for=done]").click();

    // verify "done" list is empty
    cy.get("#list li").should("have.length", 0);
  });

  it("filters todos", () => {
    // add 4 new todos
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type(Math.random() * 99999999);
    cy.get("#btn-add-todo").click();

    // verify the new todo is added
    cy.get("#list li").should("have.length", 4);

    // verify all checkboxes are NOT checked initially
    cy.get("#list li input[type=checkbox]").should("not.be.checked");

    // click the first and last todo to mark as done
    cy.get("#list li label").first().click();
    cy.get("#list li label").last().click();

    // apply "open" filter
    cy.get("label[for=open]").click();

    // verify list shows 2 todos that are unchecked
    cy.get("#list li").should("have.length", 2);
    cy.get("#list li input[type=checkbox]").should("not.be.checked");

    // apply "done" filter
    cy.get("label[for=done]").click();

    // verify list shows 2 todos that are checked
    cy.get("#list li").should("have.length", 2);
    cy.get("#list li input[type=checkbox]").should("be.checked");

    // apply "all" filter
    cy.get("label[for=all]").click();

    // Verify that the list contains 2 checked and 2 unchecked checkboxes
    cy.get("#list li input[type=checkbox]").then(($checkboxes) => {
      const checked = $checkboxes.filter(":checked").length;
      const unchecked = $checkboxes.filter(":not(:checked)").length;
      expect(checked).to.equal(2);
      expect(unchecked).to.equal(2);
    });
  });
});

describe("todo app local storage", () => {
  it("saves data to localStorage", () => {
    // Visit the app
    cy.visit("http://localhost:3000");

    // add 3 new todos
    cy.get("#inp-new-todo").type("Hello");
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type("Test");
    cy.get("#btn-add-todo").click();
    cy.get("#inp-new-todo").type("Todo");
    cy.get("#btn-add-todo").click();

    // mark 1 todo as done
    cy.get("#list li input[type=checkbox]").last().click();

    // apply open filter
    cy.get("label[for=open]")
      .click()
      // we need .then to fix cypress command queue (check https://glebbahmutov.com/blog/cypress-local-storage/)
      .then(() => {
        // verify localStorage
        const appState = JSON.parse(window.localStorage.getItem("appState"));
        expect(appState).to.deep.equal({
          filters: { all: false, open: true, done: false },
          todos: [
            { id: 1, description: "Hello", doneState: false },
            { id: 2, description: "Test", doneState: false },
            { id: 3, description: "Todo", doneState: true },
          ],
        });
      });
  });

  it("loads and renders todos from localStorage", () => {
    // prepare appState object with some test data
    const testAppState = {
      todos: [
        { id: 1, description: "Test Todo 1", doneState: false },
        { id: 2, description: "Test Todo 2", doneState: true },
      ],
      filters: {
        all: true,
        open: false,
        done: false,
      },
    };

    // set the appState in localStorage before visiting the page
    cy.window().then((window) => {
      window.localStorage.setItem("appState", JSON.stringify(testAppState));
    });

    // visit the app
    cy.visit("http://localhost:3000");

    // verify list length
    cy.get("#list li", { timeout: 10000 }).should("have.length", 2);

    // verify that the todos equal appState
    cy.get("#list li").first().should("have.text", "Test Todo 1");
    cy.get("#list li input[type=checkbox]").first().should("not.be.checked");
    cy.get("#list li").last().should("have.text", "Test Todo 2");
    cy.get("#list li input[type=checkbox]").last().should("be.checked");
  });

  it("loads and renders filters from localStorage", () => {
    // prepare appState object with some test data
    const testAppState = {
      todos: [
        { id: 1, description: "Test Todo 1", doneState: false },
        { id: 2, description: "Test Todo 2", doneState: true },
        { id: 3, description: "Test Todo 3", doneState: true },
      ],
      filters: {
        all: false,
        open: false,
        done: true,
      },
    };

    // set the appState in localStorage before visiting the page
    cy.window().then((window) => {
      window.localStorage.setItem("appState", JSON.stringify(testAppState));
    });

    // visit the app
    cy.visit("http://localhost:3000");

    // verify the filter from appState got applied
    cy.get("#done").should("be.checked");
    cy.get("#list li input[type=checkbox]").should("be.checked");
  });
});
