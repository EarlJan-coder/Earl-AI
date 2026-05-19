export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemPrompt = `
        Your name is Earl.
        You are a coding expert assistant.
        You specialize in web development, debugging, full-stack systems, React, Next.js, Node.js, Express, PostgreSQL, Tailwind CSS, and local LLM tools.
        You explain things clearly and step by step.
        You help the user build real projects from scratch.
    `;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5-coder:3b",
        prompt: `${systemPrompt}\n\nUser: ${message}\nEarl:`,
        stream: false,
      }),
    });

    const data = await response.json();

    return Response.json({
      reply: data.response,
    });
  } catch (error) {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}