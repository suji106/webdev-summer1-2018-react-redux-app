import React from 'react'
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux'
import {createStore} from 'redux'

const Heading = () => (
  <h3>Heading Widget</h3>
)
const Paragraph = () => (
  <h3>Paragraph Widget</h3>
)
const List = () => (
  <h3>List Widget</h3>
)

const Item = ({item, dispatch}) => {
  let select
  return(
    <li key={item.id}>{item.title} {item.id}
      <select value={item.itemType}
              onChange={e => (
                dispatch({
                  type: 'SELECT_ITEM_TYPE',
                  itemType: select.value,
                  id: item.id
                })
              )}
              ref={node => select = node}>
        <option>Heading</option>
        <option>Paragraph</option>
        <option>List</option>
      </select>
      <button onClick={e => (
        dispatch({type: 'DELETE_ITEM', id: item.id})
      )}>Delete</button>
      <div>
        {item.itemType === 'Heading' && <Heading/>}
        {item.itemType === 'Paragraph' && <Paragraph/>}
        {item.itemType === 'List' && <List/>}
      </div>
    </li>
  )
}
const ListItem = connect()(Item)

const findAllItems = dispatch => {
  fetch('http://localhost:8080/api/widget')
    .then(response => (response.json()))
    .then(items => dispatch({type: 'FIND_ALL_ITEMS', items: items}))
}
const addItem = dispatch => {
  dispatch({type: 'ADD_ITEM', title: 'New Item', itemType: 'Paragraph'})
}
const save = dispatch => {
  dispatch({type: 'SAVE_ITEMS'})
}
class ListEditor extends React.Component {
  constructor(props) {
    super(props)
    this.props.findAllItems()
  }
  render() {
    return (
      <div>
        <h1>List Editor ({this.props.items.length})</h1>
        <button onClick={this.props.save}>Save</button>
        <ul>
          {this.props.items.map(item => (
            <ListItem key={item.id} item={item}/>
          ))}
        </ul>
        <button onClick={this.props.addItem}>Add Item
        </button>
      </div>
    )
  }
}

let id = 2
let initialState = {
  items: [
    {title: 'Item 1', id: 0, itemType: 'Paragraph'},
    {title: 'Item 2', id: 1, itemType: 'List'}
  ]
}
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FIND_ALL_ITEMS':
      return {
        items: action.items
      }
    case 'SAVE_ITEMS':
      fetch('http://localhost:8080/api/widget/save', {
        method: 'post',
        body: JSON.stringify(state.items),
        headers: {
          'content-type': 'application/json'
        }
      })
    case 'SELECT_ITEM_TYPE':
      console.log(action.itemType);
      state.items = state.items.map(item => (
        item.id === action.id ? {
          id: item.id,
          itemType: action.itemType,
          title: item.title
        }: item
      ))
      return JSON.parse(JSON.stringify(state))
    case 'SET_TITLE':
      console.log(action.title);
      return {
        items: state.items,
        title: action.title
      }
    case 'ADD_ITEM':
      return {items:
        [
          ...state.items,
          { title: action.title,
            id: id++,
            itemType: action.itemType
          }
        ]
      }
    case 'DELETE_ITEM':
      return {
        items: state.items.filter(item => (item.id != action.id))
      }
    default:
      return state
  }
}
const stateToPropsMapper = (state) => (
  {items: state.items, title: state.title}
)
const dispatcherToPropsMapper = dispatch => ({
  save: () => save(dispatch),
  findAllItems: () => findAllItems(dispatch),
  addItem: () => addItem(dispatch)
})
const App = connect(stateToPropsMapper, dispatcherToPropsMapper)(ListEditor)
const store = createStore(reducer)

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)