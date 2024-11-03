import { TranslateService } from "@ngx-translate/core";
import { NgxEditorConfig } from "ngx-editor";

export function ngxEditorConfigFactory(translateService: TranslateService): NgxEditorConfig {
    return {
        locals: {
            // menu
            bold: translateService.stream('blog.editor.bold'),
            italic: translateService.stream('blog.editor.italic'),
            underline: translateService.stream('blog.editor.underline'),
            strike: translateService.stream('blog.editor.strike'),
            blockquote: translateService.stream('blog.editor.blockquote'),
            ordered_list: translateService.stream('blog.editor.orderedList'),
            bullet_list: translateService.stream('blog.editor.bulletList'),
            link: translateService.stream('blog.editor.link'),
            align_left: translateService.stream('blog.editor.alignLeft'),
            align_center: translateService.stream('blog.editor.alignCenter'),
            align_right: translateService.stream('blog.editor.alignRight'),
            align_justify: translateService.stream('blog.editor.alignJustify'),
            heading: translateService.stream('blog.editor.heading'),
            h1: translateService.stream('blog.editor.headingValues.h1'),
            h2: translateService.stream('blog.editor.headingValues.h2'),
            h3: translateService.stream('blog.editor.headingValues.h3'),
            h4: translateService.stream('blog.editor.headingValues.h4'),
            h5: translateService.stream('blog.editor.headingValues.h5'),
            h6: translateService.stream('blog.editor.headingValues.h6'),
            insertLink: translateService.stream('blog.editor.insertLink'),
            horizontal_rule: translateService.stream('blog.editor.horizontalRule'),
            indent: translateService.stream('blog.editor.incraseIndent'),
            outdent: translateService.stream('blog.editor.decraseIndent'),
            removeLink: translateService.stream('blog.editor.removeLink'),

            // pupups, forms, others...
            insert: translateService.stream('blog.editor.insert'),
            text: translateService.stream('blog.editor.text'),
            openInNewTab: translateService.stream('blog.editor.openInNewTab'),
            remove: translateService.stream('blog.editor.remove'),
            enterValidUrl: translateService.stream('blog.editor.enterValidUrl'),
            undo: translateService.stream('blog.editor.undo'),
            redo: translateService.stream('blog.editor.redo'),
            required: translateService.stream('register.asdsd'),
        },
    };
}