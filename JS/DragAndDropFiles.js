let uploadStorage = new DataTransfer();

// Configuration: editable max size (in MB) and allowed extensions
let maxFileSizeMB = 30;
// Set a max file count
var maxFileCount;
// set to false if you want to restrict
var allowAllFileTypes = false;
let allowedFileTypes = ["pdf", "doc", "docx", "json"];

// Convert file size in bytes to human-readable format
function formatBytes(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

// Extract file info including name, type, and size
function getFileInfo(file) {
    const fileName = file.name;
    const fileExt = file.name.split(".").pop().toLowerCase();
    const fileSize = formatBytes(file.size);
    return { fileName, fileType: fileExt, fileSize };
}

// Display validation message below drop zone
function showValidationMessage(message) {
    let $feedback = $("#dropFeedback");
    if (!$feedback.length) {
        $feedback = $(
            '<div id="dropFeedback" class="text-danger px-4 py-4 small"></div>',
        );
        $("#dropZone").parent().after($feedback);
    }
    $feedback.text(message).fadeIn();
    setTimeout(() => $feedback.fadeOut(), 5000);
}

// Handle file drop or selection
function addDroppedFile(dataFiles) {
    // Convert MB to bytes
    const maxSize = maxFileSizeMB * 1024 * 1024;

    for (const file of dataFiles) {
        // Check current count BEFORE adding
        if (typeof maxFileCount !== "undefined" && maxFileCount > 0) {
            if (uploadStorage.files.length >= maxFileCount) {
                showValidationMessage(
                    `You can only upload up to ${maxFileCount} files.`,
                );
                break; // stop adding more
            }
        }

        const ext = file.name.split(".").pop().toLowerCase();

        if (!allowAllFileTypes && !allowedFileTypes.includes(ext)) {
            showValidationMessage(
                `"${file.name}" is not an allowed type (${allowedFileTypes.join(
                    ", ",
                )}).`,
            );
            continue;
        }

        if (file.size > maxSize) {
            showValidationMessage(
                `"${file.name}" exceeds the ${maxFileSizeMB}MB limit.`,
            );
            continue;
        }

        // Add valid file to uploadStorage and display in list
        uploadStorage.items.add(file);
        const fileIndex = uploadStorage.files.length - 1;
        const { fileName, fileSize } = getFileInfo(file);

        const template = $("#fileItemTemplate").prop("content");
        const $clone = $(template).children().clone();
        $clone.attr("file-index", fileIndex);
        $clone.find(".file-name").text(`${fileName} (${fileSize})`);
        $clone
            .find(".js-remove-control-btn")
            .attr("onclick", `removeFile(${fileIndex})`);

        $("#fileList").append($clone);
    }

    // Update file input and file count text
    $("#dropFile")[0].files = uploadStorage.files;
    updateDropText();
}

// Remove a file by index and re-index the rest
function removeFile(fileIndex) {
    const dt = new DataTransfer();
    const $list = $("#fileList");
    let newIndex = 0;

    $.each(uploadStorage.files, function (i, file) {
        const $item = $list.find(`[file-index="${i}"]`);
        if (i != fileIndex) {
            dt.items.add(file);
            if ($item.length) {
                $item.attr("file-index", newIndex);
                $item
                    .find(".js-remove-control-btn")
                    .attr("onclick", `removeFile(${newIndex})`);
            }
            newIndex++;
        } else {
            if ($item.length) $item.remove();
        }
    });

    uploadStorage = dt;
    $("#dropFile")[0].files = dt.files;
    updateDropText();
}

// Update drop zone label text with file count
function updateDropText() {
    const count = uploadStorage.files.length;
    $("#dropText").text(
        `${count} ${count === 1 ? "file" : "files"} awaiting upload on save.`,
    );
}

// Initialize dropzone listeners for drag/drop and change events
function initDropzone() {
    const $dropZone = $("#dropZone");
    const $dropFile = $("#dropFile");

    $dropZone.on("dragover", function (e) {
        e.preventDefault();
        $dropZone.addClass("mouse-over");
    });

    $dropZone.on("dragleave", function (e) {
        e.preventDefault();
        $dropZone.removeClass("mouse-over");
    });

    $dropFile.on("drop", function (e) {
        e.preventDefault();
        $dropZone.removeClass("mouse-over");
        addDroppedFile(e.originalEvent.dataTransfer.files);
    });

    $dropFile.on("change", function (e) {
        e.preventDefault();
        $dropZone.removeClass("mouse-over");
        addDroppedFile(e.target.files);
    });
}

// HTML template for the drag-and-drop file uploader
// This should be included in the HTML where you want the uploader to appear
const uploadUI = `
<div class="wui-container wui-py-2 position-relative">
<div class="dropzone-wrapper position-relative" id="dropZone">
<span class="material-symbols-outlined dropzone-icon text-secondary">cloud_upload</span>
<div class="dropzone-text" id="dropText">Upload Files</div>
<div class="dropzone-desc">Drag &amp; drop PDF, DOCX, DOC files here. Max size 30MB.</div>
<input type="file" name="attachments" id="dropFile" multiple="true"
  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0; cursor: pointer; z-index: 2;" />
</div>
<button type="button" class="wui-btn primary dropzone-btn-overlap"
onclick="document.getElementById('dropFile').click();">
Select files
</button>
</div>

<ul id="fileList" class="list-group px-3 pt-3"></ul>

<template id="fileItemTemplate">
<li class="d-flex justify-content-between align-items-center py-0"
data-file-id="" file-index="">
<span class="file-name"></span>
<button type="button" class="wui-btn wui-btn-sm icon-only ghost danger p-0 border-0 bg-transparent js-remove-control-btn"
  style="box-shadow: none;">
<span class="material-symbols-outlined">close</span>
</button>
</li>
</template>
`;

// The REST Endpoint
const restEndpoint = "../api/rest.svc";
const { currentBoard, currentView, currentTable } = getCurrentDetails();
const attachmentField = "file_attachment";
var fileView = "BoardScript - File Upload";

function getCurrentDetails() {
    const commentText = document.documentElement.firstChild.textContent.trim();
    const commentSplit = commentText.split("\n");
    const currentBoard = commentSplit[0].trim().split(": ").slice(1).join("");
    const currentView = commentSplit[1].trim().split(": ").slice(1).join("");
    const currentTable = commentSplit[2].trim().split(": ").slice(1).join("");
    return { currentBoard, currentView, currentTable };
}

async function createFileRecord() {
    const files = $("#dropFile")[0].files;
    const attachmentsIDs = [];

    for (const file of files) {
        const fileNameSplit = file.name.split(".");
        const fileType = fileNameSplit[fileNameSplit.length - 1];
        const fileRecord = {
            file_name: file.name,
            file_type: fileType.toLowerCase(),
            file_size: formatBytes(file.size),
        };

        // Await AddRecord
        const attachmentID = await new Promise(function (resolve) {
            BoardScript.AddRecord("", fileView, fileRecord, function (dataid) {
                resolve(dataid);
            });
        });

        // Await upload
        await uploadFile(attachmentID, file);

        attachmentsIDs.push(attachmentID);
    }

    // After all files are uploaded
    $("[name=attachmentsIDs]").val(JSON.stringify(attachmentsIDs));
}

async function uploadFile(attachmentRecordId, file) {
    const formData = new FormData();
    formData.append("attachmentFileData", file, file.name);
    const response = await fetch(
        `${restEndpoint}/board/${currentBoard}/input/${fileView}/${attachmentRecordId}/attachments/${attachmentField}`,
        {
            method: "POST",
            body: formData,
        },
    );
}