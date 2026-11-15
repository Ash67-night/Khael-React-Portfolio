import { useState } from "react";

export default function Contact() {
  const [messageStatus, setMessageStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setMessageStatus("Sending...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save message.");
      }

      setMessageStatus("Message send successfully.");
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      setMessageStatus(
        "Could not save message. Check that the backend and database are running."
      );
    }
  }

  return (
    <section id="contact">
      <h2>Contact</h2>

      <div className="contact">
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" type="text" required />
          </label>

          <label>
            Email
            <input name="email" type="email" required />
          </label>

          <label>
            Message
            <textarea name="message" rows="5" required />
          </label>

          <button className="btn" type="submit">
            Send Message
          </button>

          <p id="ok" aria-live="polite">{messageStatus}</p>
        </form>

        <ul className="info">
          <li>
            <b>Email</b>
            <a href="mailto:khaelashlyp.tena19@gmail.com">
              khaelashlyp.tena19@gmail.com
            </a>
          </li>
          <li>
            <b>Phone</b>
            <a href="tel:+639702874845">+63 970-287-4845</a>
          </li>
        </ul>
      </div>
    </section>
  );
}