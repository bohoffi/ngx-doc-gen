import { Template } from './template';
import { TemplateType } from './template-type.enum';

export interface ServiceTemplate extends Template {
  type: TemplateType.Service;
}
