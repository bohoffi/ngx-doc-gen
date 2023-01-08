import { Template } from './template';
import { TemplateType } from './template-type.enum';

export interface EntrypointTemplate extends Template {
  type: TemplateType.Entrypoint;
}
