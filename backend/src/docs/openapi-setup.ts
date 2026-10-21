import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

/** Side-effect: enable `.openapi()` on Zod schemas (must load before docs). */
extendZodWithOpenApi(z);
