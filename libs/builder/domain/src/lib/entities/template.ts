import { TemplateType } from './template-type.enum';

export interface Template {
  name: string;
  fileName: string;
  type: TemplateType;
}
