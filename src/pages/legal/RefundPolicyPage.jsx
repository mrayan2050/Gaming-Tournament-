import LegalPageLayout, { Section } from './LegalPageLayout';

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="11 July 2026">
      <Section>
        <p>
          This policy explains when amounts deducted from your BattleArena wallet are eligible for a
          refund. Because tournament entry fees fund real prize pools, refunds are limited to the
          situations below.
        </p>
      </Section>

      <Section heading="1. Wallet Top-ups">
        <p>
          Money added to your Deposit Balance via Razorpay is non-refundable once successfully credited,
          except where required by RBI or Razorpay's own payment dispute policies for failed or
          duplicate transactions. If a payment is deducted from your bank/UPI but not credited to your
          BattleArena wallet, contact us with the payment reference so we can investigate and credit or
          refund it.
        </p>
      </Section>

      <Section heading="2. Tournament Entry Fees — Refund Eligible">
        <p>Your entry fee will be automatically refunded to your Deposit Balance if:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>The tournament is cancelled by BattleArena before it starts</li>
          <li>The tournament fails to reach the minimum number of players required</li>
          <li>A verified technical failure on our platform prevents you from participating</li>
        </ul>
      </Section>

      <Section heading="3. Tournament Entry Fees — Not Refund Eligible">
        <ul className="list-disc list-inside space-y-1.5">
          <li>You changed your mind after joining a tournament</li>
          <li>You were unable to play due to your own internet, device, or game-app issues</li>
          <li>You performed poorly or lost the match</li>
          <li>Your account was suspended for a Fair Play violation</li>
        </ul>
      </Section>

      <Section heading="4. Withdrawal Reversals">
        <p>
          If a withdrawal request is rejected by our team (for example, due to a mismatched UPI ID or
          failed KYC check), the withdrawn amount is automatically credited back to your Winnings
          Balance. No manual action is needed on your part.
        </p>
      </Section>

      <Section heading="5. How to Request a Refund">
        <p>
          If you believe you're eligible for a refund under this policy, contact{' '}
          <a href="mailto:support@battlearena.example" className="text-orange-400 hover:underline">support@battlearena.example</a>{' '}
          with your registered email, the tournament name, and date. We aim to respond within 48 hours.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
