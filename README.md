# dynamoose-zod

Type-safe Dynamoose schema generation from [Zod](https://github.com/colinhacks/zod).  
Easily build and validate your models with Zod, then convert them into Dynamoose schemas — including support for `nullable`, `optional`, keys, and indexes.

## ✨ Features

- Add Dynamoose metadata to your Zod schemas using `.dynamoose()`
- Generate Dynamoose-compatible `SchemaDefinition` with `.toDynamoose()`
- Supports:
  - `hashKey`, `rangeKey`
  - `index`
  - `optional()`, `nullable()`, default values
  - Nested objects and arrays
- Avoids duplicate `dynamoose.type.NULL` by injecting the runtime instance

## 📦 Installation

```bash
npm install dynamoose-zod zod dynamoose
# or
yarn add dynamoose-zod zod dynamoose
```

> ⚠️ Make sure to install `dynamoose` and `zod` in your app as **peer dependencies**.

## 🚀 Getting Started

```ts
import { z } from 'zod';
import { extendZodWithDynamoose } from 'dynamoose-zod';
import * as dynamoose from 'dynamoose';

// Apply the extension (must pass the same instance of `dynamoose`)
extendZodWithDynamoose(z, dynamoose);

const ZUserSchema = z.object({
  id: z.string().dynamoose({ hashKey: true }),
  email: z.string(),
  name: z.string().nullable().optional(),
  createdAt: z.string(),
});

const UserSchema = new dynamoose.Schema(ZUserSchema.toDynamoose());
```

## 🧩 Zod Metadata Extensions

Add Dynamoose metadata directly to fields:

```ts
z.string().dynamoose({ hashKey: true });
z.string().dynamoose({ rangeKey: true });
z.string().dynamoose({
  index: { name: 'my_index', type: 'global' },
});
```

Combine with `.nullable()` and `.optional()`:

```ts
z.string().nullable().optional().dynamoose({ required: false });
```

## 🔍 Supported Zod Types

| Zod Type                  | Dynamoose Mapping          |
|---------------------------|----------------------------|
| `z.string()`              | ✅ `String`                |
| `z.number()`              | ✅ `Number`                |
| `z.boolean()`             | ✅ `Boolean`               |
| `z.array()`               | ✅ `Array`                 |
| `z.object()`              | ✅ `Object`                |
| `nullable()` / `optional()` | ✅ `required: false` and `dynamoose.type.NULL` when needed |

## 📘 API Reference

### `extendZodWithDynamoose(z: typeof zod, dynamoose: typeof import('dynamoose'))`

Extends Zod with:

- `.dynamoose(meta: ZodDynamooseMeta)` on all Zod types
- `.toDynamoose()` on `z.object()` types

Make sure to use **the same `dynamoose` instance** passed into this function as the one used to define your models.

### `ZodDynamooseMeta`

```ts
type ZodDynamooseMeta = {
  hashKey?: boolean;
  rangeKey?: boolean;
  index?: {
    name: string;
    type: 'global' | 'local';
  };
  required?: boolean;
};
```

## ❗ Gotchas

- Always pass the **same instance** of `dynamoose` to `extendZodWithDynamoose()` that you're using in your app. This avoids issues with `dynamoose.type.NULL`.
- Do not install `dynamoose` as a dependency of this package — it must be listed as a `peerDependency`.

## 📄 License

MIT © 2025 Bruno Agutoli - [@agutoli](https://github.com/agutoli)

---

Made with ❤️ using [Zod](https://github.com/colinhacks/zod) + [Dynamoose](https://dynamoosejs.com/)