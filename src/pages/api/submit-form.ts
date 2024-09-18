import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    const unsubId = parseInt(locals.runtime.env.SENDGRID_UNSUBSCRIBE_GROUP_ID);
    console.log(locals.env, unsubId);
    console.log("Called");

    let formData = await request.formData();
    let fromJs = !!request.headers.get('X-From-JS');

    if (!fromJs) {
        return nope();
    }

    let turnstileData = new FormData();
    turnstileData.append("response", coerceToString(formData.get("cf-turnstile-response")));
    turnstileData.append("secret", locals.runtime.env.TURNSTILE_SECRET_KEY);
    turnstileData.append("remoteip", request.headers.get("CF-Connecting-IP") ?? '');

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        body: turnstileData,
        method: "POST",
    });

    const outcome = await result.json();
    if (!outcome.success) {
        return nope();
    }

    console.log("Turnstile verified");

    const email = formData.get('email_address');

    if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        });
    }

    console.log("Validated");

    const sendgridApiKey = locals.runtime.env.SENDGRID_API_KEY;

    // Send the Fetch request to SendGrid
    const addContactResponse = await fetch(
        "https://api.sendgrid.com/v3/marketing/contacts",
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sendgridApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                list_ids: [locals.runtime.env.SENDGRID_LIST_ID],
                contacts: [
                    {
                        email,
                    }
                ]
            }),
        })
        .then(async r => ({ ok: r.ok, body: await r.json() }))
        .catch((e) => ({ ok: false, body: e }));

    if (!addContactResponse.ok) {
        console.error("Error adding new contact", addContactResponse.body);
        return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.', data: addContactResponse }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        });
    }

    console.log("Contact added");

    // Send the email to the added contact
    const sendEmailResponse = await fetch(
        "https://api.sendgrid.com/v3/mail/send",
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendgridApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [
                            { email }
                        ]
                    }
                ],
                from: { email: 'newsletter@scriptures-of-the-chosen.com', name: 'Tyler Mercer - Scriptures of The Chosen' },
                template_id: locals.runtime.env.SENDGRID_WELCOME_TEMPLATE_ID,
                asm: {
                    group_id: unsubId
                }
            }),
        })
        .then(async r => ({ ok: r.ok, body: r.body }))
        .catch((e) => ({ ok: false, body: e }));

    console.log("Email sent");

    if (!sendEmailResponse.ok) {
        console.error("Error sending email to new contact", sendEmailResponse.body);
        return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.', data: sendEmailResponse }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        });
    }

    console.log("Sending response");

    // Return the response from SendGrid
    return new Response(JSON.stringify({ addContactResponse, sendEmailResponse }), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}

function validateEmail(email: FormDataEntryValue | null) {
    return email != null && typeof email === 'string' && email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function coerceToString(fv: FormDataEntryValue | null): string {
    return fv != null && typeof fv === 'string' ? fv : '';
}

function nope() {
    return new Response(JSON.stringify({ error: 'Please try again later' }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    });
}