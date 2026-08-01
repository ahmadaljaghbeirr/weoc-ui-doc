/**
 * GenericValidator â€” drop-in form validation.
 *
 * CONVENTIONS (required for auto-wiring):
 *
 * Error display
 *   Place a <div class="field-error"> immediately after any inputs, selects
 *   or after its wrapping *-input-group element if it was a group.
 *   For TinyMCE fields, the .field-error can be before the textarea.
 *
 * Input groups (shared error anchor)
 *   Wrap related inputs in an element whose class ends with "-input-group"
 *   e.g. days-input-group, time-input-group, status-input-group.
 *   The .field-error must be the next sibling of that wrapper.
 *
 * Day/checkbox groups
 *   Use class="days-input-group" on the wrapper.
 *   Only one checkbox in the group needs required="true" to mark the group as required.
 *
 * Radio groups
 *   Standard visible radios: validation checks at input level.
 *   Custom-styled radios with hidden inputs (e.g. card-style): wrap in a
 *   *-input-group element. Validation checks at wrapper level instead.
 *
 * TinyMCE
 *   Add data-tinymce to the textarea. Call GenericValidator.bindTinyMCE(form)
 *   after tinymce.init() resolves.
 *
 * Flatpickr
 *   No extra config needed. Attach required="true" to the original input
 *   before flatpickr initializes.
 *
 * TomSelect
 *   Add data-required="true" to the select instead of required â€” avoids
 *   browser native UI conflicts. The .field-error must be the next sibling
 *   of the .ts-wrapper div that TomSelect generates.
 *
 * required attribute
 *   Both required and required="true" are supported.
 *   For widgets that hide the original input or conflict with native UI, use data-required="true".
 */

window.GenericValidator = (function ($) {
    "use strict";

    const DEFAULT_MSG = "This field is required.";

    function isTomSelect($el) {
        return $el.is("select") && $el.hasClass("tomselected");
    }

    function isFieldRequired($el) {
        return (
            $el.is("[required], [required='true']") ||
            $el.attr("data-required") === "true"
        );
    }

    function isActive($el) {
        const el = $el[0];
        const validateHidden = $el.closest("form").data("validate-hidden") === true;

        return (
            $el.length &&
            !$el.is(":disabled") &&
            ($el.attr("type") || "").toLowerCase() !== "hidden" &&
            (validateHidden || $el.is(":visible") || isTomSelect($el))
        );
    }

    function getTinyMCEFieldError($input) {
        const $prev = $input.prev(".field-error");
        if ($prev.length) return $prev;

        const editor =
            typeof tinymce !== "undefined" ? tinymce.get($input.attr("id")) : null;
        if (editor) {
            const $container = $(editor.getContainer());
            const $prevOfContainer = $container.prev(".field-error");
            if ($prevOfContainer.length) return $prevOfContainer;
        }

        return $input
            .closest(".tab-panel, .email-subject-field, .form-group")
            .find(".field-error")
            .first();
    }

    function $errorAnchor($input) {
        const $group = $input.closest('[class*="-input-group"]');
        if ($group.length) return $group;

        const type = ($input.attr("type") || "").toLowerCase();
        if (type === "checkbox" || type === "radio") {
            const $wrap = $input.closest(".form-check, .form-check-inline").first();
            return $wrap.length ? $wrap : $input;
        }

        return $input;
    }

    function $fieldError($input) {
        const $anchor = $errorAnchor($input);
        const $sibling = $anchor.next(".field-error");
        if ($sibling.length) return $sibling;

        const $group = $input.closest('[class*="-input-group"]');
        return $group.length ? $group.next(".field-error") : $();
    }

    function clearError($input) {
        $input.removeClass("is-invalid");
        $fieldError($input).hide().text("");
    }

    function showError($input, message) {
        $input.addClass("is-invalid");
        $fieldError($input)
            .text(message || DEFAULT_MSG)
            .show();
    }

    // â”€â”€ TinyMCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function isTinyMCEField($el) {
        return $el.is("textarea[data-tinymce]");
    }

    function validateTinyMCEField($input) {
        const id = $input.attr("id");
        const editor = typeof tinymce !== "undefined" ? tinymce.get(id) : null;

        if (!editor) {
            // Editor not initialised yet â€” fall back to raw textarea value
            const ok = !!($input.val() || "").trim();
            ok ? clearTinyMCEError(id, $input) : showTinyMCEError(id, $input);
            return ok;
        }

        const ok = editor.getContent({ format: "text" }).trim().length > 0;
        ok ? clearTinyMCEError(id, $input) : showTinyMCEError(id, $input);
        return ok;
    }

    function showTinyMCEError($id, $input) {
        const editor = typeof tinymce !== "undefined" ? tinymce.get($id) : null;
        if (editor) $(editor.getContainer()).addClass("is-invalid");
        else $input.addClass("is-invalid");
        getTinyMCEFieldError($input).text(DEFAULT_MSG).show();
    }

    function clearTinyMCEError($id, $input) {
        const editor = typeof tinymce !== "undefined" ? tinymce.get($id) : null;
        if (editor) $(editor.getContainer()).removeClass("is-invalid");
        else $input.removeClass("is-invalid");
        getTinyMCEFieldError($input).hide().text("");
    }

    // Call this once after tinymce.init() resolves to wire up live validation
    function bindTinyMCEEvents($form) {
        $form
            .find(
                "textarea[data-tinymce][required], textarea[data-tinymce][required='true']",
            )
            .each(function () {
                const $textarea = $(this);
                const id = $textarea.attr("id");
                const editor = typeof tinymce !== "undefined" ? tinymce.get(id) : null;
                if (!editor) return;

                editor.on("input change", function () {
                    if (isFieldRequired($textarea)) validateTinyMCEField($textarea);
                });
            });
    }

    function getFirstInvalid($form) {
        const $activePanel = $form.find(".wui-tab-panel.active");
        const $allInvalid = $form.find(".is-invalid").first();

        if (!$allInvalid.length) return null;

        // Check if any invalid field exists in the active panel first
        const $activeInvalid = $activePanel.find(".is-invalid").first();
        return $activeInvalid.length ? $activeInvalid : $allInvalid;
    }

    // Nearest scrolling ancestor of an element, or null if none. Scrolling
    // this instead of always falling back to the document keeps a fixed
    // page header/footer (outside the scrollable region) from scrolling away.
    function scrollParentOf($el) {
        let node = $el[0] && $el[0].parentElement;
        while (node && node !== document.body && node !== document.documentElement) {
            const oy = window.getComputedStyle(node).overflowY;
            if (
                (oy === "auto" || oy === "scroll" || oy === "overlay") &&
                node.scrollHeight > node.clientHeight
            ) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }
    // â”€â”€ Core validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function validateRadioGroup($form, name) {
        const $group = $form.find(
            `input[type="radio"][name="${CSS.escape(name)}"]`,
        );

        if (!$group.length) return true;
        if (!$group.is("[required], [required='true'], [data-required='true']"))
            return true;

        const $visible = $group.filter(function () {
            return isActive($(this));
        });
        if ($visible.length) {
            const ok = $visible.is(":checked");
            if (!ok) showError($visible.first(), "Please select an option.");
            else clearError($visible.first());
            return ok;
        }

        const $wrapper = $group.first().closest('[class*="-input-group"]');
        if ($wrapper.length && !$wrapper.is(":visible")) return true;

        const ok = $group.is(":checked");
        if (!ok) showError($group.first(), "Please select an option.");
        else clearError($group.first());
        return ok;
    }

    function validateDayGroup($wrap) {
        const $inputs = $wrap.find("input[type='checkbox'], input[type='radio']");
        if (!$inputs.is("[required], [required='true']")) return true;

        const ok = $inputs.is(":checked");
        const $error = $wrap.next(".field-error");

        if (ok) {
            $wrap.removeClass("is-invalid");
            $error.hide().text("");
        } else {
            $wrap.addClass("is-invalid");
            $error.text(DEFAULT_MSG).show();
        }
        return ok;
    }

    function validateTomSelect($select) {
        const val = $select.val();
        const ok = Array.isArray(val) ? val.length > 0 : !!(val || "").trim();
        const $wrapper = $select.next(".ts-wrapper");
        const $control = $wrapper.find(".ts-control");
        const $error = $wrapper.next(".field-error");

        if (ok) {
            $control.removeClass("is-invalid");
            $error.hide().text("");
        } else {
            $control.addClass("is-invalid");
            $error.text(DEFAULT_MSG).show();
        }

        return ok;
    }

    function validateField($input) {
        if (!isActive($input) || !isFieldRequired($input)) return true;

        if (isTomSelect($input)) {
            return validateTomSelect($input);
        }

        const tag = ($input.prop("tagName") || "").toLowerCase();
        const type = ($input.attr("type") || "").toLowerCase();

        // Radios: validate the whole group
        if (type === "radio" && $input.attr("name")) {
            return validateRadioGroup($input.closest("form"), $input.attr("name"));
        }

        // Checkbox
        if (type === "checkbox") {
            const ok = $input.is(":checked");
            ok ? clearError($input) : showError($input, DEFAULT_MSG);
            return ok;
        }
        // TinyMCE textarea
        if (isTinyMCEField($input)) {
            return validateTinyMCEField($input);
        }

        // Text/select/textarea
        const val = (($input.val() ?? "") + "").trim();
        const ok = !!val;

        ok ? clearError($input) : showError($input, DEFAULT_MSG);
        return ok;
    }

    function validateForm($form) {
        let ok = true;

        $form.find(".is-invalid").removeClass("is-invalid");
        $form.find(".field-error").hide().text("");

        const names = new Set();
        $form
            .find(
                "input[type='radio'][required], input[type='radio'][required='true'], input[type='radio'][data-required='true']",
            )
            .each(function () {
                if (this.name) names.add(this.name);
            });

        $form.find(".days-input-group").each(function () {
            ok = validateDayGroup($(this)) && ok;
        });

        names.forEach(function (name) {
            ok = validateRadioGroup($form, name) && ok;
        });

        $form
            .find("textarea[data-tinymce]")
            .filter("[required], [required='true']")
            .each(function () {
                const $el = $(this);
                if (!isFieldRequired($el)) return;
                ok = validateTinyMCEField($el) && ok;
            });

        $form
            .find("input, select, textarea")
            .filter("[required], [required='true'], [data-required='true']")
            .not("[type='radio']")
            .not(".days-input-group input")
            .not("[data-tinymce]")
            .each(function () {
                const $el = $(this);
                if (!isActive($el)) return;
                ok = validateField($el) && ok;
            });

        if (!ok) {
            const $target = getFirstInvalid($form);
            if (!$target) return ok;

            const isTabbedForm = $form.data("tab-panel") === true;

            if (isTabbedForm) {
                const $panel = $target.closest(".wui-tab-panel");
                if ($panel.length) {
                    const panelId = $panel.attr("id").replace("panel-", "");
                    if (typeof switchTab === "function") {
                        // legacy hand-rolled tabs (e.g. AAR) — untouched convention
                        switchTab(panelId);
                    } else {
                        // weoc-ui engine-driven tabs (e.g. migrated EventReporting):
                        // no per-view global switchTab anymore, drive the engine instead
                        const group = $panel.attr("data-wui-view-group");
                        if (group && window.WUI && typeof WUI.showView === "function") {
                            WUI.showView(group, panelId);
                        }
                    }
                }
            }

            setTimeout(
                function () {
                    if ($target.is(":visible")) {
                        const scroller = scrollParentOf($target);
                        if (scroller) {
                            const delta =
                                $target[0].getBoundingClientRect().top -
                                scroller.getBoundingClientRect().top;
                            $(scroller).animate(
                                { scrollTop: scroller.scrollTop + delta - 20 },
                                250,
                            );
                        } else {
                            $("html, body").animate(
                                { scrollTop: $target.offset().top - 120 },
                                250,
                            );
                        }
                        $target.trigger("focus");
                    }
                },
                isTabbedForm ? 50 : 0,
            );
        }

        return ok;
    }

    $(document).on(
        "change",
        ".days-input-group input[type='checkbox'], .days-input-group input[type='radio']",
        function () {
            const $wrap = $(this).closest(".days-input-group");
            if ($wrap.find("input").is("[required], [required='true']"))
                validateDayGroup($wrap);
        },
    );

    return {
        validateForm: function (formOrSelector) {
            const $form = $(formOrSelector);
            return validateForm($form.is("form") ? $form : $form.closest("form"));
        },
        validateField: function (elOrSelector) {
            return validateField($(elOrSelector));
        },
        clearField: function (elOrSelector) {
            const $el = $(elOrSelector);
            if (isTomSelect($el)) {
                $el.next(".ts-wrapper").find(".ts-control").removeClass("is-invalid");
                $el.next(".ts-wrapper").next(".field-error").hide().text("");
            } else {
                clearError($el);
            }
        },
        clearForm: function (formOrSelector) {
            const $form = $(formOrSelector);
            $form.find(".is-invalid").removeClass("is-invalid");
            $form.find(".field-error").hide().text("");
            $form.find(".ts-control.is-invalid").removeClass("is-invalid");
        },
        bindTinyMCE: function (formOrSelector) {
            bindTinyMCEEvents($(formOrSelector));
        },
    };
})(jQuery);

// â”€â”€ Global event bindings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

$(document)
    .on("input", "form input, form textarea", function () {
        GenericValidator.validateField(this);
    })
    .on("change", "form input, form select, form textarea", function () {
        GenericValidator.validateField(this);
    })

    .on(
        "submit",
        "form:has([required],[required='true'],[data-required='true'])",
        function (e) {
            if (!GenericValidator.validateForm(this)) e.preventDefault();
        },
    );