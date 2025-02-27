import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Veil Research",
  description: "Privacy Policy for Veil Research platform — how we collect, use, and protect your data.",
}

const LAST_UPDATED = "28 April 2025"

export default function Privacy() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#ededff" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "100px", marginBottom: "20px",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            fontSize: "12px", fontWeight: 700, color: "#10b981", letterSpacing: "0.06em",
          }}>
            LEGAL
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "14px", color: "#4a4a6a" }}>Last updated: {LAST_UPDATED}</p>
          <p style={{ fontSize: "15px", color: "#7878a8", marginTop: "16px", lineHeight: 1.7, maxWidth: "600px" }}>
            Your privacy matters to us. This policy explains what data we collect, why we collect it,
            how we use it, and your rights over your information.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

          <Section title="1. Who We Are">
            <P>Veil Research ("Veil", "we", "us") is an AI research platform operated by Vibhor Pandey, based in Dehradun, Uttarakhand, India. Our platform is accessible at veilresearch.com.</P>
            <P>For any privacy-related concerns, contact us at <a href="mailto:vibhorpandey09@gmail.com" style={{ color: "#8b5cf6", textDecoration: "none" }}>vibhorpandey09@gmail.com</a>.</P>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection label="2.1 Information you provide directly">
              <ul style={listStyle}>
                <li><strong style={{ color: "#ededff" }}>Email address</strong> — when you create an account, sign in, or join the waitlist</li>
                <li><strong style={{ color: "#ededff" }}>Password</strong> — stored as a secure hash via Supabase; we never see your raw password</li>
                <li><strong style={{ color: "#ededff" }}>Display name</strong> — optionally set in your profile settings</li>
                <li><strong style={{ color: "#ededff" }}>Chat messages</strong> — text you send to AI models within the platform</li>
                <li><strong style={{ color: "#ededff" }}>API keys</strong> — third-party API keys you optionally connect (stored locally in your browser; not sent to our servers)</li>
              </ul>
            </SubSection>

            <SubSection label="2.2 Information collected automatically">
              <ul style={listStyle}>
                <li><strong style={{ color: "#ededff" }}>Usage data</strong> — which models you use, how many messages you send, which modes you activate</li>
                <li><strong style={{ color: "#ededff" }}>Subscription status</strong> — your plan tier, trial usage, and billing status</li>
                <li><strong style={{ color: "#ededff" }}>Session data</strong> — authentication tokens stored in browser cookies and localStorage</li>
                <li><strong style={{ color: "#ededff" }}>Technical data</strong> — browser type, device type, IP address (collected by Vercel infrastructure)</li>
              </ul>
            </SubSection>

            <SubSection label="2.3 Information we do NOT collect">
              <ul style={listStyle}>
                <li>We do not collect your phone number unless you provide it</li>
                <li>We do not collect payment card details — all payments are handled directly by Razorpay</li>
                <li>We do not collect your third-party API keys on our servers</li>
                <li>We do not collect biometric data</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <P>We use the information we collect to:</P>
            <ul style={listStyle}>
              <li>Create and manage your account and authenticate your identity</li>
              <li>Deliver AI model responses and process your chat messages</li>
              <li>Track your free trial usage per AI model to enforce trial limits</li>
              <li>Process subscription payments and manage your billing through Razorpay</li>
              <li>Send transactional emails including login links and waitlist confirmations via Resend</li>
              <li>Improve the platform based on usage patterns and feedback</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
            <P>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</P>
          </Section>

          <Section title="4. How We Share Your Information">
            <P>We share your data only with the following categories of third parties, strictly as necessary to operate the service:</P>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
              {[
                { name: "Supabase", purpose: "Authentication and database storage. Your email, hashed password, and subscription data are stored here.", link: "https://supabase.com/privacy" },
                { name: "OpenAI", purpose: "Processing chat messages sent to GPT-4o and GPT-4o mini models. Messages are subject to OpenAI's usage policies.", link: "https://openai.com/privacy" },
                { name: "NVIDIA (NGC API)", purpose: "Processing chat messages sent to Llama 3 70B and DeepSeek R1 models.", link: "https://www.nvidia.com/en-us/about-nvidia/privacy-policy/" },
                { name: "Razorpay", purpose: "Payment processing for subscriptions. We share your email to create a customer record. Card details are handled entirely by Razorpay.", link: "https://razorpay.com/privacy/" },
                { name: "Resend", purpose: "Sending transactional emails including waitlist confirmations and login links.", link: "https://resend.com/privacy" },
                { name: "Vercel", purpose: "Hosting the platform and serving web traffic. Vercel may collect IP addresses and request logs.", link: "https://vercel.com/legal/privacy-policy" },
              ].map(s => (
                <div key={s.name} style={{
                  padding: "16px 20px", borderRadius: "12px",
                  background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "4px" }}>{s.name}</div>
                  <div style={{ fontSize: "13.5px", color: "#7878a8", lineHeight: 1.6 }}>{s.purpose}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Data Storage and Security">
            <P>Your data is stored on Supabase infrastructure hosted on AWS in secure data centres. All data in transit is encrypted using TLS/HTTPS. Passwords are hashed using industry-standard algorithms and are never stored in plain text.</P>
            <P>Row-level security (RLS) policies are enforced at the database level — your data is accessible only by your authenticated account. No other user can access your data.</P>
            <P>While we implement industry-standard security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.</P>
          </Section>

          <Section title="6. Cookies and Local Storage">
            <P>Veil uses the following browser storage mechanisms:</P>
            <ul style={listStyle}>
              <li><strong style={{ color: "#ededff" }}>Authentication cookies</strong> — set by Supabase to maintain your login session across page loads. These are essential and cannot be disabled without logging out.</li>
              <li><strong style={{ color: "#ededff" }}>localStorage</strong> — used to store your display name and optionally entered third-party API keys (OpenAI, NVIDIA) on your device only. This data is never sent to our servers.</li>
            </ul>
            <P>We do not use advertising cookies, cross-site tracking cookies, or analytics cookies from third-party ad networks.</P>
          </Section>

          <Section title="7. Data Retention">
            <P>We retain your data for as long as your account is active. If you delete your account:</P>
            <ul style={listStyle}>
              <li>Your authentication data is deleted immediately from Supabase</li>
              <li>Your chat messages and usage data are deleted within 30 days</li>
              <li>Your subscription and billing records may be retained for up to 7 years as required by Indian financial regulations</li>
              <li>Your waitlist email, if submitted, is retained unless you request removal</li>
            </ul>
          </Section>

          <Section title="8. Your Rights">
            <P>You have the following rights regarding your personal data:</P>
            <ul style={listStyle}>
              <li><strong style={{ color: "#ededff" }}>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong style={{ color: "#ededff" }}>Correction</strong> — request correction of inaccurate or incomplete data</li>
              <li><strong style={{ color: "#ededff" }}>Deletion</strong> — request deletion of your account and associated data</li>
              <li><strong style={{ color: "#ededff" }}>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong style={{ color: "#ededff" }}>Opt-out of emails</strong> — unsubscribe from non-transactional communications at any time</li>
            </ul>
            <P>To exercise any of these rights, email us at <a href="mailto:vibhorpandey09@gmail.com" style={{ color: "#8b5cf6", textDecoration: "none" }}>vibhorpandey09@gmail.com</a>. We will respond within 14 business days.</P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>Veil is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, please contact us and we will delete it promptly.</P>
            <P>Users between 13 and 18 may use the platform with appropriate understanding of these terms. We recommend parental guidance for minors.</P>
          </Section>

          <Section title="10. International Data Transfers">
            <P>Your data may be processed in countries outside India, including the United States, where our infrastructure providers (Supabase, Vercel, OpenAI, Resend) operate. These transfers are made subject to appropriate data protection safeguards.</P>
          </Section>

          <Section title="11. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or a prominent notice on the platform. The "Last updated" date at the top of this page reflects the most recent revision.</P>
            <P>Continued use of Veil after changes are posted constitutes your acceptance of the updated Privacy Policy.</P>
          </Section>

          <Section title="12. Contact Us">
            <P>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:</P>
            <div style={{
              padding: "24px 28px", borderRadius: "14px", marginTop: "8px",
              background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Vibhor Pandey</div>
              <div style={{ fontSize: "14px", color: "#7878a8", marginBottom: "2px" }}>Founder, Veil Research</div>
              <div style={{ fontSize: "14px", color: "#7878a8", marginBottom: "2px" }}>UPES University, Dehradun, Uttarakhand — 248007, India</div>
              <a href="mailto:vibhorpandey09@gmail.com" style={{ fontSize: "14px", color: "#8b5cf6", textDecoration: "none", display: "block", marginTop: "8px" }}>
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

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "10px" }}>{label}</div>
      {children}
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "15px", color: "#7878a8", lineHeight: 1.75 }}>{children}</p>
}

const listStyle: React.CSSProperties = {
  paddingLeft: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: "#7878a8",
  fontSize: "15px",
  lineHeight: "1.7",
}
