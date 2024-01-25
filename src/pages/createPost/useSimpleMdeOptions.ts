import EasyMDE from "easymde";
import { useMemo } from "react";

export const useSimpleMdeOptions = () =>
{
    return useMemo(
        () => ({
            spellChecker: false,
            maxHeight: '25rem',
            autofocus: false,
            placeholder: 'Enter text...',
            status: false,
            toolbar:
                [
                    {
                        name: "bold",
                        action: EasyMDE.toggleBold,
                        className: "none",
                        text: "B",
                        title: "Bold",
                    },
                    {
                        name: "italic",
                        action: EasyMDE.toggleItalic,
                        className: "none",
                        text: '\uD835\uDC3C',
                        title: "Italic",
                    },
                    {
                        name: "heading",
                        action: EasyMDE.toggleHeading1,
                        className: "none",
                        text: 'H',
                        title: "Heading",
                    },
                    {
                        name: "quote",
                        action: EasyMDE.toggleBlockquote,
                        className: "none",
                        text: '\u201C\u201D',
                        title: "Quote",
                    },
                    {
                        name: "genericList",
                        action: EasyMDE.toggleUnorderedList,
                        className: "none",
                        text: "UL",
                        title: "Unordered List",
                    },
                    {
                        name: "orderedList",
                        action: EasyMDE.toggleOrderedList,
                        className: "none",
                        text: "OL",
                        title: "Ordered List",
                    } as EasyMDE.ToolbarIcon,
                ]
        } as EasyMDE.Options),
        [],);
}