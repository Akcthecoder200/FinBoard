// Dynamic Data Mapping System
// Handles API response exploration, field discovery, and custom data mapping

export interface ApiFieldSchema {
  name: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "date"
    | "unknown";
  nullable: boolean;
  nested?: ApiFieldSchema[];
  sampleValues?: unknown[];
  description?: string;
}

export interface ApiResponseSchema {
  apiSource: string;
  endpoint: string;
  timestamp: Date;
  fields: ApiFieldSchema[];
  metadata: {
    responseSize: number;
    responseTime: number;
    statusCode: number;
  };
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: TransformationRule;
  description?: string;
}

export interface TransformationRule {
  type: "direct" | "calculate" | "format" | "combine" | "extract";
  formula?: string;
  parameters?: Record<string, unknown>;
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  apiSource: string;
  mappings: FieldMapping[];
  createdAt: Date;
  updatedAt: Date;
}

class DataMappingService {
  private schemas: Map<string, ApiResponseSchema> = new Map();
  private templates: Map<string, MappingTemplate> = new Map();

  // Analyze API response and generate schema
  analyzeApiResponse(
    apiSource: string,
    endpoint: string,
    response: unknown,
    metadata: { responseSize: number; responseTime: number; statusCode: number }
  ): ApiResponseSchema {
    const fields = this.extractFields(response);

    const schema: ApiResponseSchema = {
      apiSource,
      endpoint,
      timestamp: new Date(),
      fields,
      metadata,
    };

    const schemaKey = `${apiSource}_${endpoint}`;
    this.schemas.set(schemaKey, schema);

    console.log(`📊 Schema generated for ${apiSource}:${endpoint}`, schema);
    return schema;
  }

  // Recursively extract field information from API response
  private extractFields(obj: unknown, prefix = ""): ApiFieldSchema[] {
    const fields: ApiFieldSchema[] = [];

    if (obj === null || obj === undefined) {
      return [
        {
          name: prefix || "root",
          type: "unknown",
          nullable: true,
          sampleValues: [obj],
        },
      ];
    }

    if (Array.isArray(obj)) {
      const arrayField: ApiFieldSchema = {
        name: prefix || "array",
        type: "array",
        nullable: false,
        sampleValues: [obj.length],
      };

      // Analyze first few array items for nested structure
      if (obj.length > 0) {
        const sampleItem = obj[0];
        if (typeof sampleItem === "object" && sampleItem !== null) {
          arrayField.nested = this.extractFields(sampleItem, `${prefix}[0]`);
        }
      }

      fields.push(arrayField);
      return fields;
    }

    if (typeof obj === "object") {
      Object.entries(obj).forEach(([key, value]) => {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        const fieldType = this.determineFieldType(value);

        const field: ApiFieldSchema = {
          name: fieldName,
          type: fieldType,
          nullable: value === null || value === undefined,
          sampleValues: [value],
        };

        // Add description based on field name patterns
        field.description = this.generateFieldDescription(key, value);

        // Recursively analyze nested objects
        if (fieldType === "object" && value !== null) {
          field.nested = this.extractFields(value, fieldName);
        }

        fields.push(field);
      });
    } else {
      // Primitive value
      fields.push({
        name: prefix || "value",
        type: this.determineFieldType(obj),
        nullable: false,
        sampleValues: [obj],
      });
    }

    return fields;
  }

  // Determine the type of a field value
  private determineFieldType(value: unknown): ApiFieldSchema["type"] {
    if (value === null || value === undefined) return "unknown";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") {
      // Check if it's a date string
      if (this.isDateString(value)) return "date";
      return "string";
    }
    return "unknown";
  }

  // Check if a string represents a date
  private isDateString(str: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
    ];

    return (
      datePatterns.some((pattern) => pattern.test(str)) &&
      !isNaN(Date.parse(str))
    );
  }

  // Generate human-readable field descriptions
  private generateFieldDescription(fieldName: string, value: unknown): string {
    const name = fieldName.toLowerCase();

    // Common financial field patterns
    if (name.includes("price") || name === "close" || name === "open") {
      return "Stock price value";
    }
    if (name.includes("volume")) {
      return "Trading volume";
    }
    if (name.includes("change") && typeof value === "number") {
      return "Price change amount or percentage";
    }
    if (name.includes("symbol") || name === "ticker") {
      return "Stock symbol/ticker";
    }
    if (name.includes("name") || name === "companyName") {
      return "Company or asset name";
    }
    if (name.includes("cap") && name.includes("market")) {
      return "Market capitalization";
    }
    if (
      name.includes("date") ||
      name.includes("time") ||
      name.includes("timestamp")
    ) {
      return "Date/time information";
    }
    if (name.includes("high")) {
      return "High price";
    }
    if (name.includes("low")) {
      return "Low price";
    }

    return `Field: ${fieldName}`;
  }

  // Create a mapping template
  createMappingTemplate(
    name: string,
    description: string,
    apiSource: string,
    mappings: Omit<FieldMapping, "id">[]
  ): MappingTemplate {
    const template: MappingTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      apiSource,
      mappings: mappings.map((mapping, index) => ({
        ...mapping,
        id: `mapping_${Date.now()}_${index}`,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    console.log(`📝 Created mapping template: ${name}`, template);
    return template;
  }

  // Apply field mappings to transform data
  applyMapping(
    data: unknown,
    template: MappingTemplate
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    template.mappings.forEach((mapping) => {
      try {
        const sourceValue = this.extractValue(data, mapping.sourceField);
        const transformedValue = this.applyTransformation(
          sourceValue,
          mapping.transformation
        );
        this.setValue(result, mapping.targetField, transformedValue);
      } catch (error) {
        console.warn(
          `Failed to apply mapping ${mapping.sourceField} -> ${mapping.targetField}:`,
          error
        );
      }
    });

    return result;
  }

  // Extract value from nested object path
  private extractValue(obj: unknown, path: string): unknown {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) return undefined;

      // Handle array notation like "items[0]"
      if (key.includes("[") && key.includes("]")) {
        const [arrayKey, indexStr] = key.split("[");
        const index = parseInt(indexStr.replace("]", ""));

        if (
          typeof current === "object" &&
          arrayKey in (current as Record<string, unknown>)
        ) {
          const arrayValue = (current as Record<string, unknown>)[arrayKey];
          if (
            Array.isArray(arrayValue) &&
            index >= 0 &&
            index < arrayValue.length
          ) {
            current = arrayValue[index];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        if (typeof current === "object" && current !== null && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
    }

    return current;
  }

  // Set value in nested object path
  private setValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  // Apply transformation rules to values
  private applyTransformation(
    value: unknown,
    rule?: TransformationRule
  ): unknown {
    if (!rule || rule.type === "direct") {
      return value;
    }

    switch (rule.type) {
      case "format":
        if (
          typeof value === "number" &&
          rule.parameters?.format === "currency"
        ) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: (rule.parameters.currency as string) || "USD",
          }).format(value);
        }
        if (
          typeof value === "number" &&
          rule.parameters?.format === "percentage"
        ) {
          return `${(value * 100).toFixed(2)}%`;
        }
        return value;

      case "calculate":
        if (typeof value === "number" && rule.formula) {
          try {
            // Simple formula evaluation (be careful with eval in production!)
            const formula = rule.formula.replace("value", value.toString());
            return eval(formula);
          } catch {
            return value;
          }
        }
        return value;

      case "extract":
        if (typeof value === "string" && rule.parameters?.regex) {
          const match = value.match(
            new RegExp(rule.parameters.regex as string)
          );
          return match ? match[1] || match[0] : value;
        }
        return value;

      default:
        return value;
    }
  }

  // Get all schemas
  getSchemas(): ApiResponseSchema[] {
    return Array.from(this.schemas.values());
  }

  // Get schema for specific API
  getSchema(
    apiSource: string,
    endpoint: string
  ): ApiResponseSchema | undefined {
    return this.schemas.get(`${apiSource}_${endpoint}`);
  }

  // Get all templates
  getTemplates(): MappingTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(id: string): MappingTemplate | undefined {
    return this.templates.get(id);
  }

  // Update existing template
  updateTemplate(
    id: string,
    updates: Partial<MappingTemplate>
  ): MappingTemplate | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Auto-generate mapping suggestions based on field names
  suggestMappings(
    schema: ApiResponseSchema,
    targetFields: string[]
  ): FieldMapping[] {
    const suggestions: FieldMapping[] = [];

    targetFields.forEach((targetField) => {
      const suggestion = this.findBestMatch(schema.fields, targetField);
      if (suggestion) {
        suggestions.push({
          id: `suggestion_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          sourceField: suggestion.name,
          targetField,
          description: `Auto-suggested mapping: ${suggestion.name} -> ${targetField}`,
        });
      }
    });

    return suggestions;
  }

  // Find best matching field for a target field
  private findBestMatch(
    fields: ApiFieldSchema[],
    targetField: string
  ): ApiFieldSchema | undefined {
    const target = targetField.toLowerCase();

    // Exact match
    let bestMatch = fields.find((field) => field.name.toLowerCase() === target);
    if (bestMatch) return bestMatch;

    // Partial match
    bestMatch = fields.find(
      (field) =>
        field.name.toLowerCase().includes(target) ||
        target.includes(field.name.toLowerCase())
    );
    if (bestMatch) return bestMatch;

    // Semantic matching for common financial fields
    const semanticMatches: Record<string, string[]> = {
      price: ["close", "last", "current", "value"],
      symbol: ["ticker", "code", "id"],
      change: ["diff", "delta", "movement"],
      volume: ["vol", "trades", "count"],
      name: ["title", "company", "description"],
    };

    for (const [semantic, aliases] of Object.entries(semanticMatches)) {
      if (target.includes(semantic)) {
        bestMatch = fields.find((field) =>
          aliases.some((alias) => field.name.toLowerCase().includes(alias))
        );
        if (bestMatch) return bestMatch;
      }
    }

    return undefined;
  }
}

// Export singleton instance
export const dataMappingService = new DataMappingService();

// Utility functions for common transformations
export const transformations = {
  toCurrency: (value: number, currency = "USD"): TransformationRule => ({
    type: "format",
    parameters: { format: "currency", currency },
  }),

  toPercentage: (): TransformationRule => ({
    type: "format",
    parameters: { format: "percentage" },
  }),

  calculate: (formula: string): TransformationRule => ({
    type: "calculate",
    formula,
  }),

  extract: (regex: string): TransformationRule => ({
    type: "extract",
    parameters: { regex },
  }),
};
