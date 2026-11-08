export const json = (data: unknown, status = 200) => Response.json(data, { status });
export const err = (message: string, status = 400) => Response.json({ error: message }, { status });
export async function body<T = any>(req: Request): Promise<T> { try { return await req.json(); } catch { return {} as T; } }
