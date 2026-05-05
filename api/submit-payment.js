export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Supabase env missing" });
    }

    const data = req.body || {};

    const payload = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      plan: data.plan || "Starter ₹199",
      amount: data.amount || 199,
      utr: data.utr || data.transactionId || "",
      screenshot_name: data.screenshotName || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/upi_payments`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase insert failed",
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment proof submitted successfully",
      data: JSON.parse(result),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
