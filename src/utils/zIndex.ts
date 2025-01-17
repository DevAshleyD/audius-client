/**
 * Standardize the use of zIndex across the application
 *
 * NOTE: default modal zIndex is 10,000 and the modal bg is 9,999
 */

export enum zIndex {
  // These are still set in css, added here for reference
  // TODO: use these enums
  // FROSTED_HEADER_BACKGROUND = 10,
  // HEADER_CONTAINER = 13,
  // NAVIGATOR = 14,
  NAVIGATOR_POPUP = 15,
  NAVIGATOR_POPUP_OVERFLOW_POPUP = 16,

  // Set to 1000 to account for nested modals inside, which take a higher z-index
  EDIT_TRACK_MODAL = 1000,
  EDIT_PLAYLIST_MODAL = 1000,
  IMAGE_SELECTION_POPUP = 1001
}

export default zIndex
