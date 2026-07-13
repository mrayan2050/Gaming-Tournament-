import LegalPageLayout, { Section } from './LegalPageLayout';

export default function FairPlayRulesPage() {
  return (
    <LegalPageLayout title="Fair Play Rules" lastUpdated="11 July 2026">
      <Section>
        <p>
          BattleArena is built on skill-based competition. To keep it fair for everyone, all players must
          follow these rules. Violations can result in forfeiture of prizes, account suspension, or
          permanent bans.
        </p>
      </Section>

      <Section heading="1. Prohibited Conduct">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Using cheats, hacks, aimbots, macros, or any third-party software that provides an unfair advantage</li>
          <li>Exploiting bugs or glitches in a game instead of reporting them</li>
          <li>Colluding with other players to manipulate match outcomes or split prizes unfairly</li>
          <li>Creating or using multiple accounts to enter the same tournament more than once ("multi-accounting")</li>
          <li>Impersonating another player, or playing a match on someone else's behalf</li>
          <li>Sharing, selling, or transferring your account to another person</li>
          <li>Abusive, discriminatory, or threatening behavior toward other players, opponents, or staff</li>
        </ul>
      </Section>

      <Section heading="2. Match Conduct">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Join tournaments only if you intend to play them through to completion</li>
          <li>Follow the specific rules listed on each tournament's detail page (format, time limits, in-game mode)</li>
          <li>Report technical issues or suspected cheating immediately, with evidence (screenshots/recordings) where possible</li>
        </ul>
      </Section>

      <Section heading="3. Results & Disputes">
        <p>
          Tournament results are entered by BattleArena administrators based on official in-game results
          or submitted proof. If you believe a result was recorded incorrectly, contact support within 24
          hours of the tournament ending, along with supporting evidence. Decisions made after review are
          final.
        </p>
      </Section>

      <Section heading="4. Enforcement">
        <ul className="list-disc list-inside space-y-1.5">
          <li>First violation: warning and/or forfeiture of the prize for that tournament</li>
          <li>Repeated or severe violations: temporary suspension</li>
          <li>Serious violations (cheating software, multi-accounting for financial gain, collusion): permanent account ban and forfeiture of Deposit and Winnings Balances</li>
        </ul>
      </Section>

      <Section heading="5. Reporting a Violation">
        <p>
          If you suspect another player of violating these rules, report it to{' '}
          <a href="mailto:support@battlearena.example" className="text-orange-400 hover:underline">support@battlearena.example</a>{' '}
          with the tournament name, player details, and any evidence you have.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
