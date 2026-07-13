import LegalPageLayout, { Section } from './LegalPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="11 July 2026">
      <Section>
        <p>
          This Privacy Policy explains how BattleArena ("we", "us", "our") collects, uses, and protects
          your personal information when you use our website and services. By creating an account or
          using BattleArena, you agree to the practices described here.
        </p>
      </Section>

      <Section heading="1. Information We Collect">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Account details: name, email address, phone number, and profile photo (via Google or Mobile OTP login)</li>
          <li>Financial information: wallet transaction history, UPI ID / bank details you provide for withdrawals</li>
          <li>Gameplay data: tournaments joined, match results, rank, and prize history</li>
          <li>Technical data: IP address, device/browser information, and log data for fraud prevention</li>
        </ul>
      </Section>

      <Section heading="2. How We Use Your Information">
        <ul className="list-disc list-inside space-y-1.5">
          <li>To create and manage your account and wallet</li>
          <li>To process tournament entries, results, and prize payouts</li>
          <li>To verify your identity and age (18+) where required</li>
          <li>To detect and prevent fraud, cheating, or abuse of the platform</li>
          <li>To communicate important updates about your account or transactions</li>
          <li>To comply with legal obligations, including tax reporting on winnings</li>
        </ul>
      </Section>

      <Section heading="3. Payment Information">
        <p>
          We do not store your full card details. Deposits are processed through Razorpay, a licensed
          payment gateway, and we only receive confirmation of successful payments — not your card or
          UPI credentials. Withdrawal UPI IDs you provide are stored solely to process your payout.
        </p>
      </Section>

      <Section heading="4. Data Sharing">
        <p>We do not sell your personal data. We may share information only with:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Payment processors (Razorpay) to complete deposits and withdrawals</li>
          <li>Firebase/Google, for authentication</li>
          <li>Law enforcement or regulators, where legally required</li>
        </ul>
      </Section>

      <Section heading="5. Data Retention & Security">
        <p>
          We retain account and transaction records for as long as your account is active and for a
          reasonable period afterward to meet legal and tax obligations. We use industry-standard
          measures (encrypted connections, hashed credentials, access controls) to protect your data,
          though no online system can guarantee absolute security.
        </p>
      </Section>

      <Section heading="6. Your Rights">
        <p>
          You can view and edit your profile information from your Profile page at any time. To request
          deletion of your account or data, contact us using the details below — note that we may need
          to retain certain transaction records to comply with financial regulations even after account
          deletion.
        </p>
      </Section>

      <Section heading="7. Children's Privacy">
        <p>
          BattleArena is intended for users aged 18 and above. We do not knowingly collect data from
          anyone under 18. If we learn a minor has created an account, we will terminate it and delete
          associated data.
        </p>
      </Section>

      <Section heading="8. Changes to This Policy">
        <p>
          We may update this policy from time to time. Continued use of BattleArena after changes are
          posted constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section heading="9. Contact Us">
        <p>Questions about this policy? Reach us at <a href="mailto:support@battlearena.example" className="text-orange-400 hover:underline">support@battlearena.example</a>.</p>
      </Section>
    </LegalPageLayout>
  );
}
