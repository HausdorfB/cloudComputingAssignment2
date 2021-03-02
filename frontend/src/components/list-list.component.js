import React, { Component } from 'react';
import axios from 'axios';
import TodoTableRow from './listTableRow';

export default class TodosList extends Component {

  constructor(props) {
    super(props);
    this.state = {todos: []};
  }

  componentDidMount() {
    axios.get('http://localhost:4000/todos/')
      .then(response => {
        this.setState({ todos: response.data });
      })
      .catch(function (error){
        console.log(error);
      })
  }

  componentDidUpdate() {
    axios.get('http://localhost:4000/todos/')
      .then(response => {
        this.setState({ todos: response.data });
      })
      .catch(function (error){
        console.log(error);
      })
  }

  todoList() {
    return this.state.todos.map(function (currentTodo, i){
      return <TodoTableRow todo={currentTodo} key={i} />;
    })
  }

  render() {
      return (
          <div>
            <h3>Locations List</h3>
            <table className="table table-striped" style={{ marginTop: 20 }} >
              <thead>
                <tr>
                  <th>Street Name</th>
                  <th>City</th>
                  <th>Travel Priority</th>
                  <th>Actions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.todoList() }
              </tbody>
            </table>
          </div>
      )
  }
}