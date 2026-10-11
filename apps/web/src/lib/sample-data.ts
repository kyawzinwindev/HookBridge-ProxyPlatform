import type { JsonValue } from "@hookbridge/types";

export interface InspectorEvent {
  id: string;
  name: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  time: string;
  forwarded: string;
  body: JsonValue;
  headers: Record<string, string>;
  response: {
    status: number;
    statusText: string;
    time: string;
    headers: Record<string, string>;
    body: JsonValue;
  };
}

export const INGEST_URL = "https://api.hookbridge.dev/in/wh_live_99x";

export const METRICS = [
  { label: "Total Events", value: "1,420", hint: "24h" },
  { label: "Success Rate", value: "98.4%", hint: "23 failed" },
  { label: "Avg Relay Latency", value: "42ms", hint: "p50" },
  { label: "Active Tunnel", value: "1", hint: "Local CLI" },
];

export const EVENTS: InspectorEvent[] = [
  {
    id: "evt_viber_9821",
    name: "viber.message.received",
    method: "POST",
    path: "/in/wh_live_99x/viber",
    status: 200,
    latency: 45,
    time: "2s ago",
    forwarded: "http://localhost:3000/webhooks/viber",
    body: {
      event: "message",
      timestamp: 1760025841023,
      message_token: 5098034272017990000,
      sender: {
        id: "01234567890A=",
        name: "Aung Min",
        avatar: "https://media-direct.cdn.viber.com/avatar.jpg",
        country: "MM",
        language: "en",
        api_version: 8,
      },
      message: {
        type: "text",
        text: "Hi! Is my order ready for pickup?",
        tracking_data: "tracking_ord_4412",
      },
      silent: false,
    },
    headers: {
      Host: "api.hookbridge.dev",
      "Content-Type": "application/json",
      "Content-Length": "412",
      "User-Agent": "Viber/Webhook",
      "X-Viber-Content-Signature": "a3f1c9e2b87d4f60c5e91d3a7b2f48e1",
      "X-Forwarded-For": "52.31.140.22",
      "X-Request-Id": "req_7c91ab20",
    },
    response: {
      status: 200,
      statusText: "OK",
      time: "45ms",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Powered-By": "Express",
        "Content-Length": "27",
      },
      body: { received: true, queued: "job_20481" },
    },
  },
  {
    id: "evt_stripe_7714",
    name: "stripe.payment_intent.succeeded",
    method: "POST",
    path: "/in/wh_live_99x/stripe",
    status: 200,
    latency: 38,
    time: "14s ago",
    forwarded: "http://localhost:3000/webhooks/stripe",
    body: {
      id: "evt_1QxK2pLkdIwHu7ix8Zp0aB1c",
      object: "event",
      api_version: "2024-06-20",
      created: 1760025829,
      type: "payment_intent.succeeded",
      livemode: false,
      data: {
        object: {
          id: "pi_3QxK2pLkdIwHu7ix0N5mV9aD",
          object: "payment_intent",
          amount: 4900,
          currency: "usd",
          status: "succeeded",
          customer: "cus_R8mXq2LpT4vNzA",
          receipt_email: "sam@acme.dev",
          metadata: { order_id: "ord_10293", plan: "pro_monthly" },
        },
      },
    },
    headers: {
      Host: "api.hookbridge.dev",
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": "688",
      "User-Agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
      "Stripe-Signature":
        "t=1760025829,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd",
      "X-Request-Id": "req_3be20f77",
    },
    response: {
      status: 200,
      statusText: "OK",
      time: "38ms",
      headers: {
        "Content-Type": "application/json",
        "X-Powered-By": "Express",
        "Content-Length": "17",
      },
      body: { received: true },
    },
  },
  {
    id: "evt_github_5530",
    name: "github.push",
    method: "POST",
    path: "/in/wh_live_99x/github",
    status: 500,
    latency: 320,
    time: "41s ago",
    forwarded: "http://localhost:3000/webhooks/github",
    body: {
      ref: "refs/heads/main",
      before: "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      after: "b4c8e1f3a7d29065e1c0d8a2f57b6e394c1a07d2",
      repository: {
        id: 482910331,
        full_name: "acme/billing-service",
        private: true,
        default_branch: "main",
      },
      pusher: { name: "dev-sam", email: "sam@acme.dev" },
      head_commit: {
        id: "b4c8e1f3a7d29065e1c0d8a2f57b6e394c1a07d2",
        message: "fix: handle null customer on invoice.finalized",
        timestamp: "2026-10-10T00:03:12+07:00",
        added: [],
        removed: [],
        modified: ["src/invoices/finalize.ts"],
      },
      forced: false,
    },
    headers: {
      Host: "api.hookbridge.dev",
      "Content-Type": "application/json",
      "Content-Length": "921",
      "User-Agent": "GitHub-Hookshot/a1b2c3d",
      "X-GitHub-Event": "push",
      "X-GitHub-Delivery": "72d3162e-cc78-11e3-81ab-4c9367dc0958",
      "X-Hub-Signature-256":
        "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17",
    },
    response: {
      status: 500,
      statusText: "Internal Server Error",
      time: "320ms",
      headers: {
        "Content-Type": "application/json",
        "X-Powered-By": "Express",
        "Content-Length": "112",
      },
      body: {
        error: "InternalServerError",
        message: "Cannot read properties of undefined (reading 'signature')",
        stack: "at verifySignature (/app/src/webhooks/github.js:21:34)",
      },
    },
  },
  {
    id: "evt_shopify_3307",
    name: "shopify.orders.create",
    method: "POST",
    path: "/in/wh_live_99x/shopify",
    status: 200,
    latency: 52,
    time: "1m ago",
    forwarded: "http://localhost:3000/webhooks/shopify",
    body: {
      id: 820982911946154500,
      order_number: 1042,
      email: "jane.doe@example.com",
      currency: "USD",
      total_price: "129.00",
      financial_status: "paid",
      fulfillment_status: null,
      line_items: [
        { id: 866550311766439000, title: "Linen Overshirt", quantity: 1, price: "89.00" },
        { id: 866550311766439001, title: "Canvas Tote", quantity: 2, price: "20.00" },
      ],
      shipping_address: { city: "Chiang Mai", country_code: "TH", zip: "50200" },
      created_at: "2026-10-10T00:02:41+07:00",
    },
    headers: {
      Host: "api.hookbridge.dev",
      "Content-Type": "application/json",
      "Content-Length": "774",
      "User-Agent": "Shopify-Captain-Hook",
      "X-Shopify-Topic": "orders/create",
      "X-Shopify-Shop-Domain": "acme-store.myshopify.com",
      "X-Shopify-Hmac-Sha256": "XWmrwMey6OsLMeiZKwP4FppHH3cmAiiJJAweH5Jo4bM=",
    },
    response: {
      status: 200,
      statusText: "OK",
      time: "52ms",
      headers: {
        "Content-Type": "application/json",
        "X-Powered-By": "Express",
        "Content-Length": "19",
      },
      body: { ok: true, order: 1042 },
    },
  },
];
