/*global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	var subject, model, view;

	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it('should show entries on start-up', function () {
		// TODO: write test
		var todo = {title: 'a todo'};									 // Define a todo
		setUpModel([todo]);												 // Set up the model
		
		subject.setView('');											 // Set a view without a specific route

		expect(view.render).toHaveBeenCalledWith('showEntries', [todo]); // Expect the view to call the "render" method with "showEntries" et the array of todos to display
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			// TODO: write test
			var todo = {title: 'a todo', completed: false};											// Define an active todo
			setUpModel([todo]);																		// Set up the model

			subject.setView('#/active');															// Set the view with "active" route

			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));		// Expect the model to call "read" method with the object "{completed: false}" and a callback function to return all active todos from db
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);						// Expect the view to call the "render" method with "showEntries" as parameter to display the todos

		});

		it('should show completed entries', function () {
			// TODO: write test
			var todo = {title:'a todo', completed: true};											// Define a completed todo
			setUpModel([todo]);																		// Set up the model

			subject.setView('#/completed');															// Set the view with "completed" route

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));		// Expect the model to call "read" method with the object "{completed: true}" and a callback function to return all completed todos from db
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);						// Expect the view to call the "render" method with "showEntries" as parameter to display the todos
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
		var todo = {title: 'a todo'};								// Define a todo
		setUpModel([todo]);											// Set up the model

		subject.setView('');										// Set the view without a route
		expect(view.render).toHaveBeenCalledWith('setFilter', '');	// Expect the view to call "render" method with "setFilter" and an empty string as parameters

	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		var todo = {title: 'a todo'};										// Define a todo
		setUpModel([todo]);													// Set up the model

		subject.setView('#/active');										// Set the view with an active route
		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');	// Expect the view to call "render" method with "setFilter" and "active" as parameters
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			// TODO: write test
			var todo = {id: 42, title: 'an active todo', completed: false};							 // Define an active todo

			setUpModel([todo]);																		 // Set up the model
			subject.setView('');																	 // Set the view without a specific view

			view.trigger('toggleAll', {completed: true});											 // Call "toggleAll" event with the object "{completed: true}" as parameter		
			
			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));		 // Expect the model to call "read" method with the object "{completed: false}" and a callback funtion to return all active todos from db
			expect(model.update).toHaveBeenCalledWith(42, {completed: true}, jasmine.any(Function)); // Expect the model to call "update" method with the id of the todo, the object "{completed: false}" and a callback funtion to update the active todos as completed

		});

		it('should update the view', function () {
			// TODO: write test
			var todo = {id: 42, title: 'an active todo', completed: false};							// Define an active todo

			setUpModel([todo]);																		// Set up the model																
			subject.setView('');																	// Set the view without a specific route
			
			view.trigger('toggleAll', {completed: true});											// Call "toggleAll" event with the object "{completed: true}" as parameter	 

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: true}); // Expect the view to call "render" method with "elementComplete" and an object as parameters
		});

	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test
			setUpModel([]);																		// Set up the model without any todo

			subject.setView('');																// Set the view without a specific route
			
			view.trigger('newTodo', 'a new todo');												// Call the "newTodo" event with a string as parameter
			
			expect(model.create).toHaveBeenCalledWith('a new todo', jasmine.any(Function));		// Expect the model to call "create" method with the title of the new todo and a callback function
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			// TODO: write test
			var todo = {id: 42, title: 'a todo'};									// Define a todo
			setUpModel([todo]);														// Set up the model

			subject.setView('');													// Set the view without a route
			view.trigger('itemRemove', {id: 42});									// Call "itemRemove" event with the id of the todo to remove in parameter

			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));	// Expect the model to call "remove" method with '42', the ID of the remove todo, and a callback function
		});

		it('should remove an entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});

	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});

		it('should leave edit mode on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});

		it('should persist the changes on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});

		it('should not persist the changes on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
