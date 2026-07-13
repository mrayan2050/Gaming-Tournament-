import LegalPageLayout, { Section } from './LegalPageLayout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="11 July 2026">
      <Section>
        <p>
          These Terms of Service ("Terms") govern your use of BattleArena. By creating an account, you
          agree to be bound by these Terms. If you do not agree, please do not use the platform.
        </p>
      </Section>

      <Section heading="1. Eligibility">
        <ul className="list-disc list-inside space-y-1.5">
          <li>You must be at least 18 years old to create an account or participate in any paid tournament.</li>
          <li>Real-money tournaments are not available to residents of states where such games are restricted by law, including Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, and Sikkim.</li>
          <li>You must provide accurate account information and are responsible for maintaining the confidentiality of your account.</li>
        </ul>
      </Section>

      <Section heading="2. Nature of the Games">
        <p>
          Tournaments offered on BattleArena are games of skill, where outcomes are determined
          predominantly by player ability rather than chance. Participation involves financial risk —
          entry fees are not guaranteed to be recovered, and outcomes depend on your performance
          relative to other players.
        </p>
      </Section>

      <Section heading="3. Wallet, Deposits & Entry Fees">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Your wallet has two components: Deposit Balance (funds you add) and Winnings Balance (prize money earned).</li>
          <li>Deposit Balance is used to pay tournament entry fees and is non-transferable to other users.</li>
          <li>Entry fees are deducted immediately upon joining a tournament and are generally non-refundable once a tournament has started (see our Refund Policy for exceptions).</li>
          <li>Deposits are processed via Razorpay; we do not store your card details.</li>
        </ul>
      </Section>

      <Section heading="4. Withdrawals">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Only your Winnings Balance can be withdrawn to a UPI ID or bank account.</li>
          <li>Withdrawal requests are typically processed within 24 hours, subject to verification.</li>
          <li>We reserve the right to request identity verification (KYC) before processing withdrawals above a certain threshold, in line with applicable regulations.</li>
        </ul>
      </Section>

      <Section heading="5. Fair Play & Account Termination">
        <p>
          Cheating, use of unauthorized software, collusion, or any attempt to manipulate tournament
          results is strictly prohibited (see our Fair Play Rules for details). We reserve the right to
          suspend or permanently terminate any account found violating these Terms, including forfeiture
          of any Deposit or Winnings Balance obtained through prohibited conduct.
        </p>
      </Section>

      <Section heading="6. Taxes">
        <p>
          Under Indian tax law (Section 194BA of the Income Tax Act), winnings from online games are
          subject to Tax Deducted at Source (TDS) at the applicable rate. Where required, TDS will be
          deducted before winnings are credited or withdrawn, and you are responsible for reporting your
          winnings in your own tax filings.
        </p>
      </Section>

      <Section heading="7. Limitation of Liability">
        <p>
          BattleArena is provided "as is." We are not liable for losses arising from your participation
          in tournaments, technical outages, third-party payment processing delays, or your own
          violation of these Terms. Play responsibly and only wager amounts you can afford.
        </p>
      </Section>

      <Section heading="8. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will be communicated via the
          platform. Continued use after changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section heading="9. Governing Law">
        <p>
          These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
          jurisdiction of the courts in the location of our registered office.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
