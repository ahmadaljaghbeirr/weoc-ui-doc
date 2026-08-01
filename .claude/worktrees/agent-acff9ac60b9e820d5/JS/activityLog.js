/* Start: Activity Log Utility */
/* <viewlink board="EOC - Activities"  name="BoardScript - Add Log Activity"/>*/

/*
const isEditMode = `<value-of select="/data/@dataid"/>` !== '0';
localStorage.setItem("isUpdated", String(isEditMode)); 
*/

/*
const parentDataid = `<value-of select="/data/@dataid"/>`;
const username = `<value-of select="/data/@username" />`;
const position = `<value-of select="/data/@positionname" />`;
const boardName = `<boardname/>`;
const viewName = "Input - Information Sharing";
const isUpdated = localStorage.getItem("isUpdated") === "true";
const actionName = `${isUpdated ? "Updated" : "Created"} Information Sharing`;

const logOptions = {
  recordDataId: parentDataid,
  actionName: actionName,
  boardName: boardName,
  viewName: viewName,
  Username: username,
  PositionName: position,
};
*/

// Log an activity entry to the EOC - Activities board.
window.logActivity = function (options = "") {
  if (!options) return Promise.resolve();

  let logData = {
    RecordDataId: String(options.recordDataId || ""),
    ActionName: options.actionName || "",
    BoardName: options.boardName || "",
    ViewName: options.viewName || "",
    Username: options.Username || "",
    PositionName: options.PositionName || "",
  };

  return new Promise(function (resolve, reject) {
    BoardScript.AddRecord(
      "EOC - Activities",
      "BoardScript - Add Log Activity",
      logData,
      function () {
        resolve();
      },
    );
  });
};
// end funtion
//===============================================

/* End: Activity Log Utility */
