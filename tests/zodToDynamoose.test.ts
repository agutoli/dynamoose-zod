import { z } from "zod";
import * as dynamoose from "dynamoose";
import { zodToDynamoose, extendZodWithDynamoose } from "../src";

describe("zod-to-dynamoose", () => {
  describe("zodToDynamoose()", () => {
    it("should convert ZodObject with basic fields", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        isActive: z.boolean(),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        name: String,
        age: Number,
        isActive: Boolean,
      });
    });

    it("should convert ZodArray fields", () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        tags: { type: Array, schema: [String] },
      });
    });

    it("should convert nested ZodObject fields", () => {
      const schema = z.object({
        meta: z.object({
          createdAt: z.string(),
        }),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        meta: {
          type: Object,
          schema: {
            createdAt: String,
          },
        },
      });
    });

    it("should convert and validate product data with options (array of record-based objects)", () => {
      extendZodWithDynamoose(z, dynamoose);
    
      const ProductBaseDbSchema = z.object({
        id: z.string(),
      });
    
      const ProductOptionsItemDbSchema = z.object({
        title: z.string(),
      });
    
      const ProductOptionsDbSchema = z.object({
        type: z.string(),
        options: z.record(ProductOptionsItemDbSchema),
      });
    
      const ProductDbZodSchema = ProductBaseDbSchema.extend({
        options: z.array(ProductOptionsDbSchema),
      });
    
      const dynamooseSchema = zodToDynamoose(ProductDbZodSchema, dynamoose);
    
      // Test the structure of the generated schema
      expect(dynamooseSchema).toEqual({
        id: String,
        options: {
          type: Array,
          schema: [
            {
              type: Object,
              schema: {
                type: String,
                options: {
                  type: Map,
                  schema: {
                    type: Object,
                    schema: {
                      title: String,
                    },
                  },
                },
              },
            },
          ],
        },
      });
    
      // Use Zod to validate a real data example
      const productData = {
        id: "abc123",
        options: [
          {
            type: "colour",
            options: {
              "223": { title: "Graphite Black" },
              "085": { title: "Sonic Quartz" },
              "1J7": { title: "Sonic Titanium" },
              "3U3": { title: "Scarlet Crimson" },
            },
          },
        ],
      };
    
      // Should pass Zod validation
      const parsed = ProductDbZodSchema.parse(productData);
      expect(parsed).toEqual(productData);
    });
    
    it("should convert ZodAny fields to Object type", () => {
      const schema = z.object({
        misc: z.any(),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        misc: Object,
      });
    });

    it("should allow metadata on ZodAny via .dynamoose()", () => {
      extendZodWithDynamoose(z, dynamoose);

      const schema = z.object({
        data: z.any().dynamoose({ required: false }),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        data: { type: Object, required: false },
      });
    });

    it("should convert ZodRecord fields to Map", () => {
      const schema = z.object({
        options: z.record(z.object({ title: z.string() })),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        options: {
          type: Map,
          schema: {
            type: Object,
            schema: {
              title: String,
            },
          },
        },
      });
    });

    it("should convert ZodOptional and ZodNullable fields", () => {
      const schema = z.object({
        nickname: z.string().optional(),
        bio: z.string().nullable(),
      });

      const result = zodToDynamoose(schema, dynamoose);

      expect(result).toEqual({
        nickname: { type: String, required: false },
        bio: { type: String, required: false },
      });
    });

    it("throws on unsupported Zod types", () => {
      const unsupportedSchema = z.function();

      const schema = z.object({
        fn: unsupportedSchema,
      });

      expect(() => zodToDynamoose(schema, dynamoose)).toThrow(
        /Unsupported Zod type: ZodFunction/
      );
    });
  });

  describe("extendZodWithDynamoose()", () => {
    it("should add metadata via .dynamoose()", () => {
      extendZodWithDynamoose(z, dynamoose);

      const withMeta = z.string().dynamoose({
        index: {
          name: "myIndex",
          type: "global",
        },
      });

      const description = withMeta.description!;
      const parsed = JSON.parse(description);

      expect(parsed.dynamoose).toEqual({
        index: {
          name: "myIndex",
          type: "global",
        },
      });
    });

    it("should extend ZodObject with .toDynamoose()", () => {
      extendZodWithDynamoose(z, dynamoose);

      const schema = z.object({
        id: z.string().dynamoose({ hashKey: true }),
        age: z.number(),
      });

      const result = schema.toDynamoose();

      expect(result).toEqual({
        id: { type: String, hashKey: true },
        age: Number,
      });
    });
  });
});
