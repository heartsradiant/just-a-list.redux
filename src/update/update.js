const debug = require("debug")("ReduxAllIsList:ListUpdate")

import { map, filterBy, merge, hasWith } from "@asd14/m"

/**
 * Call API to update an item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  apiMethod        API call
 * @param  {string}    actionStartName  Action dispatched before API
 * @param  {string}    actionEndName    Action dispatched after API
 *
 * @return {Promise<Object>}
 */
export const updateAction = ({
  dispatch,
  apiMethod,
  actionStartName,
  actionEndName,
}) => (id, data) => {
  dispatch({
    type: actionStartName,
    payload: {
      id,
      data,
    },
  })

  return Promise.resolve(apiMethod(id, data)).then(itemUpdated => {
    dispatch({
      type: actionEndName,
      payload: {
        itemUpdated,
      },
    })

    return itemUpdated
  })
}

/**
 * Modify state to indicate one item in list is being updated
 *
 * @param  {Object}         state  Old state
 * @param  {number|string}  id     Updating item ID
 * @param  {Object}         data   Updating item data
 *
 * @return {Object} New state
 */
export const updateStartReducer = (state, { id, data }) => {
  const isAlreadyUpdating = hasWith({ id })(state.itemsUpdating)

  isAlreadyUpdating &&
    debug(
      "updateStartReducer: ID already updating, doing nothing (will still trigger a rerender)",
      {
        id,
        itemsUpdating: state.itemsUpdating,
      }
    )

  return {
    ...state,
    itemsUpdating: isAlreadyUpdating
      ? state.itemsUpdating
      : [...state.itemsUpdating, { id, data }],
  }
}

/**
 * Add newly created item to list
 *
 * @param {Object}  state        Current state
 * @param {Object}  arg2         Payload
 * @param {Object}  arg2.update  API response
 *
 * @return {Object}
 */
export const updateEndReducer = (state, { itemUpdated }) => ({
  ...state,
  items: map(item =>
    item.id === itemUpdated.id ? merge(item, itemUpdated) : item
  )(state.items),
  itemsUpdating: filterBy({ "!id": itemUpdated.id })(state.itemsUpdating),
})
