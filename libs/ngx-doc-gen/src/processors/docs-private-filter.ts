import { DocCollection, Processor } from 'dgeni';
import { BaseApiDoc } from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import { ClassExportDoc } from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import { InterfaceExportDoc } from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import { getDocsPublicTag, isPublicDoc } from '../common/private-docs';

/**
 * Processor to filter out symbols that should not be shown in the docs.
 */
export class DocsPrivateFilter implements Processor {
  name = 'docs-private-filter';
  $runBefore = ['categorizer'];
  $runAfter = ['mergeInheritedProperties'];

  public docsPublic = 'docs-public';
  public docsPrivate = 'docs-private';

  $process(docs: DocCollection) {
    const publicDocs = docs.filter(doc => isPublicDoc(doc, this.docsPublic, this.docsPrivate));

    publicDocs.forEach(doc => {
      // Update the API document name in case the "docs-public" tag is used with an alias name.
      if (doc instanceof BaseApiDoc) {
        const docsPublicTag = getDocsPublicTag(doc, this.docsPublic);
        if (docsPublicTag !== undefined && docsPublicTag.description) {
          doc.name = docsPublicTag.description;
        }
      }

      if (doc instanceof InterfaceExportDoc) {
        doc.members = doc.members.filter(doc => isPublicDoc(doc, this.docsPublic, this.docsPrivate));
      }

      // Filter out private class members which could be annotated with the "docs-private" tag.
      if (doc instanceof ClassExportDoc) {
        doc.members = doc.members.filter(doc => isPublicDoc(doc, this.docsPublic, this.docsPrivate));
        doc.statics = doc.statics.filter(doc => isPublicDoc(doc, this.docsPublic, this.docsPrivate));
      }
    });

    return publicDocs;
  }
}
