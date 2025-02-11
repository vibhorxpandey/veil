import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions — Veil Research",
  description: "Terms and Conditions for using the Veil Research platform.",
}

const LAST_UPDATED = "28 April 2025"

export default function Terms() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "100px", marginBottom: "20px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
            fontSize: "12px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.06em",
          }}>
            LEGAL
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontSize: "14px", color: "#4a4a6a" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

          <Section title="1. Acceptance of Terms">
            <P>By accessing or using Veil Research ("Veil", "we", "our", "us") at veilresearch.com, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the platform.</P>
            <P>These Terms apply to all visitors, users, and others who access or use the platform. By creating an account, you confirm that you are at least 13 years of age and have the legal capacity to enter into these Terms.</P>
          </Section>

          <Section title="2. Description of Service">
            <P>Veil Research is an AI-powered research workspace that provides access to large language models, research workflows, and productivity tools for researchers, students, and ML engineers. The platform offers four specialized modes: Research, Biology, Flywheel, and Write.</P>
            <P>We reserve the right to modify, suspend, or discontinue the service at any time, with or without notice. We shall not be liable to you or any third party for any such modification, suspension, or discontinuation.</P>
          </Section>

          <Section title="3. User Accounts">
            <P>To access certain features of Veil, you must create an account. You agree to:</P>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#7878a8", fontSize: "15px", lineHeight: "1.7" }}>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Keep your password and account credentials secure</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Take responsibility for all activity that occurs under your account</li>
              <li>Not share your account with any third party</li>
            </ul>
            <P>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or misuse the platform.</P>
          </Section>

          <Section title="4. Free Trial">
            <P>Veil offers a limited free trial that gives each registered user one (1) free message per supported AI model (currently four models), for a total of four free interactions. This trial is granted per account, is non-transferable, and cannot be reset by creating a new account with the same email address.</P>
            <P>Once the free trial is exhausted, continued access to the platform requires an active paid subscription. We reserve the right to modify or discontinue the free trial at any time.</P>
          </Section>

          <Section title="5. Subscriptions and Billing">
            <P>Veil offers the following subscription plans:</P>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#7878a8", fontSize: "15px", lineHeight: "1.7" }}>
              <li><strong style={{ color: "#ededff" }}>Early Access</strong> — ₹199/month (limited availability; price locked for the life of your subscription)</li>
              <li><strong style={{ color: "#ededff" }}>Pro Monthly</strong> — ₹699/month (billed monthly, cancel anytime)</li>
              <li><strong style={{ color: "#ededff" }}>Pro Annual</strong> — ₹8099/year (billed annually)</li>
            </ul>
            <P>All payments are processed securely through Razorpay. By subscribing, you authorize Razorpay to charge your payment method on a recurring basis. Subscriptions renew automatically unless cancelled before the renewal date.</P>
            <P>Early Access pricing is guaranteed for the lifetime of your continuous subscription. If you cancel and resubscribe, standard pricing will apply.</P>
            <P><strong style={{ color: "#ededff" }}>Refunds:</strong> We provide a 7-day refund policy on first-time subscriptions for users who have not made extensive use of the platform. Refund requests must be submitted to vibhorpandey09@gmail.com within 7 days of the charge. Subsequent billing cycles are non-refundable.</P>
          </Section>

          <Section title="6. Acceptable Use">
            <P>You agree not to use Veil to:</P>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#7878a8", fontSize: "15px", lineHeight: "1.7" }}>
              <li>Produce content that is illegal, harmful, threatening, abusive, or defamatory</li>
              <li>Violate any applicable local, national, or international laws or regulations</li>
              <li>Infringe on the intellectual property rights of any party</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the platform</li>
              <li>Use automated tools to scrape, crawl, or extract data from the platform at scale</li>
              <li>Produce, distribute, or promote misinformation, spam, or deceptive content</li>
              <li>Attempt to circumvent subscription limits, trial restrictions, or authentication systems</li>
              <li>Resell, redistribute, or sublicense access to the platform</li>
            </ul>
            <P>Violations of these terms may result in immediate account suspension or termination without refund.</P>
          </Section>

          <Section title="7. AI-Generated Content">
            <P>Veil provides access to AI language models operated by third parties including OpenAI and NVIDIA. AI-generated outputs may be inaccurate, incomplete, or inappropriate. You are solely responsible for verifying and validating any AI-generated content before relying on it.</P>
            <P>We do not claim ownership over content you submit to or receive from the AI models. However, you grant us a limited, non-exclusive license to process your inputs as required to deliver the service.</P>
            <P>Do not submit sensitive personal data, confidential business information, or classified material to the platform's AI features.</P>
          </Section>

          <Section title="8. Intellectual Property">
            <P>The Veil platform — including its design, logo, codebase, workflows, and all associated intellectual property — is owned by Vibhor Pandey and protected under applicable intellectual property laws.</P>
            <P>You retain ownership of content you create using Veil. By using the platform, you grant us a limited license to process, store, and display your content solely for the purpose of delivering the service.</P>
            <P>You may not use the Veil name, logo, or brand assets without prior written permission.</P>
          </Section>

          <Section title="9. Third-Party Services">
            <P>Veil integrates with third-party services including but not limited to OpenAI, NVIDIA, Supabase, Razorpay, Resend, GitHub, Hugging Face, and Weights &amp; Biases. Use of these services is governed by their respective terms and privacy policies. We are not responsible for the practices, availability, or content of third-party services.</P>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <P>Veil is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure.</P>
            <P>We make no warranties regarding the accuracy, reliability, or completeness of AI-generated content. Research outputs from Veil should be independently verified before being relied upon.</P>
          </Section>

          <Section title="11. Limitation of Liability">
            <P>To the fullest extent permitted by applicable law, Veil Research and its founder shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the platform.</P>
            <P>Our total liability to you for any claims arising from these Terms or your use of the service shall not exceed the amount you paid to us in the three months preceding the claim.</P>
          </Section>

          <Section title="12. Termination">
            <P>You may close your account at any time by contacting us at vibhorpandey09@gmail.com or through your dashboard settings. Upon termination, your access to paid features will continue until the end of your current billing period.</P>
            <P>We may terminate or suspend your account immediately, without prior notice, if you breach these Terms, engage in fraudulent activity, or if we are required to do so by law.</P>
          </Section>

          <Section title="13. Governing Law">
            <P>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms are subject to the exclusive jurisdiction of the courts of Dehradun, Uttarakhand, India.</P>
          </Section>

          <Section title="14. Changes to Terms">
            <P>We reserve the right to update these Terms at any time. We will notify users of significant changes via email or a notice on the platform. Continued use of Veil after changes are posted constitutes your acceptance of the updated Terms.</P>
          </Section>

          <Section title="15. Contact">
            <P>If you have questions about these Terms, please reach out:</P>
            <div style={{
              padding: "20px 24px", borderRadius: "14px", marginTop: "8px",
              background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ fontSize: "14.5px", color: "#ededff", fontWeight: 700, marginBottom: "4px" }}>Vibhor Pandey</div>
              <div style={{ fontSize: "14px", color: "#7878a8" }}>Founder, Veil Research</div>
              <div style={{ fontSize: "14px", color: "#7878a8" }}>UPES University, Dehradun, Uttarakhand, India</div>
              <a href="mailto:vibhorpandey09@gmail.com" style={{ fontSize: "14px", color: "#8b5cf6", textDecoration: "none", display: "block", marginTop: "6px" }}>
                vibhorpandey09@gmail.com
              </a>
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "16px", letterSpacing: "-0.01em" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.75 }}>{children}</p>
}
