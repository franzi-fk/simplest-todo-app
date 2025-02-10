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
  it("loads and renders todos from localStorage", () => {
    // Prepare appState object with some test data
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

    // Set the appState in localStorage before visiting the page
    cy.window().then((window) => {
      window.localStorage.setItem("appState", JSON.stringify(testAppState));
    });

    // Visit the app
    cy.visit("http://localhost:3000");

    // Wait for the todos to render
    cy.get("#list li", { timeout: 10000 }).should("have.length", 2); // Wait for the list items to appear

    // Verify that the todos are rendered in the UI
    cy.get("#list li").first().should("have.text", "Test Todo 1");
    cy.get("#list li input[type=checkbox]").first().should("not.be.checked");
    cy.get("#list li").last().should("have.text", "Test Todo 2");
    cy.get("#list li input[type=checkbox]").last().should("be.checked");
  });
});
