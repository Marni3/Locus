import { Entry, Theme, ThemeObservation } from '../types';

export const DEMO_USER_ID = 'demo-evaluator';

export function getSampleDemoDataset(userId: string = DEMO_USER_ID): {
  entries: Entry[];
  themes: Theme[];
  observations: ThemeObservation[];
} {
  const now = new Date();
  const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  // 1. Authentically Staged 30-Day Chronological Reflection Entries
  const entries: Entry[] = [
    {
      id: 'demo-entry-1',
      userId,
      title: 'Paralysis Around Scope and Launching',
      createdAt: subDays(30),
      concludedAt: subDays(30),
      status: 'concluded',
      category: 'Work',
      mood: 'Overwhelmed',
      mode: 'reflect',
      stance: 'reflect',
      locationContext: {
        name: 'Home Office, Desk',
        source: 'manual',
      },
      tags: ['Friction', 'Decision'],
      keyTakeaways: [
        'Endless build tooling refactoring acted as an emotional shield against vulnerability.',
        'Shipping requires drawing a definitive scope boundary on secondary features.',
        'Immediate goal: establish the single core reflection loop with real users.'
      ],
      summary:
        'Confronted severe creative paralysis around project launch. Realized that endlessly refactoring build tools and staging configs was an emotional buffer against shipping. Decided to define a minimal viable boundary and pause all secondary features.',
      starred: true,
      isDemo: true,
      turns: [
        {
          id: 'turn-1-1',
          entryId: 'demo-entry-1',
          role: 'user',
          content:
            "I'm feeling stuck and scattered today. I've spent three days rewriting configuration files and reorganizing my workspace, but I haven't written a line of core application logic. I think I'm terrified of putting this in front of users.",
          timestamp: subDays(30),
          isPinned: true,
          note: 'Identified hidden perfectionism as fear of exposure.',
        },
        {
          id: 'turn-1-2',
          entryId: 'demo-entry-1',
          role: 'model',
          content:
            "Recognizing that tooling tweaks can serve as an emotional shield is a pivotal realization. When we feel anxious about user judgment, perfectionism masquerades as diligence. If you strip away the secondary tooling, what is the single essential interaction your user needs on day one?",
          timestamp: subDays(30),
        },
      ],
    },
    {
      id: 'demo-entry-2',
      userId,
      title: 'Architectural Simplicity & Momentum',
      createdAt: subDays(23),
      concludedAt: subDays(23),
      status: 'concluded',
      category: 'Creative',
      mood: 'Energized',
      mode: 'brainstorm',
      stance: 'brainstorm',
      locationContext: {
        name: 'The Mill Coffee, SF',
        source: 'manual',
      },
      tags: ['Breakthrough'],
      summary:
        'Discovered immense creative momentum by eliminating auxiliary microservices and anchoring on an Object-Oriented UX model. The physical change of environment provided cognitive spaciousness.',
      starred: false,
      isDemo: true,
      turns: [
        {
          id: 'turn-2-1',
          entryId: 'demo-entry-2',
          role: 'user',
          content:
            'Sitting in a coffee shop today with my laptop. Cut two redundant backend workers and unified the pipeline synchronously into Entry conclusion. Suddenly everything feels light and manageable again.',
          timestamp: subDays(23),
        },
        {
          id: 'turn-2-2',
          entryId: 'demo-entry-2',
          role: 'model',
          content:
            'Radical simplification usually generates the most authentic creative relief. Notice how removing unnecessary moving parts didn’t degrade the product; it restored your clarity and agency.',
          timestamp: subDays(23),
        },
      ],
    },
    {
      id: 'demo-entry-3',
      userId,
      title: 'Delegation Friction & Control Anxiety',
      createdAt: subDays(16),
      concludedAt: subDays(16),
      status: 'concluded',
      category: 'Leadership',
      mood: 'Anxious',
      mode: 'actionable',
      stance: 'actionable',
      locationContext: {
        name: 'Home Office, Late Night',
        source: 'manual',
      },
      tags: ['Friction', 'Leadership'],
      summary:
        'Examined anxiety around handing off the UI components to collaborators. Acknowledged that hoarding tasks under the pretense of "maintaining tone" was causing physical exhaustion.',
      starred: false,
      isDemo: true,
      turns: [
        {
          id: 'turn-3-1',
          entryId: 'demo-entry-3',
          role: 'user',
          content:
            "I'm exhausted from trying to review every single commit personally. I told myself nobody else understands the aesthetic tone, but I'm creating a bottleneck and burning out.",
          timestamp: subDays(16),
          isPinned: true,
          note: 'Bottleneck caused by uncommunicated design standards.',
        },
        {
          id: 'turn-3-2',
          entryId: 'demo-entry-3',
          role: 'model',
          content:
            'When standards remain implicit in your head, delegation feels like abdication. If you codify the aesthetic rules into an explicit design system token doc, your team can self-police quality without you being the bottleneck.',
          timestamp: subDays(16),
        },
      ],
    },
    {
      id: 'demo-entry-4',
      userId,
      title: 'Walking & Clear Interface Boundaries',
      createdAt: subDays(9),
      concludedAt: subDays(9),
      status: 'concluded',
      category: 'Leadership',
      mood: 'Calm',
      mode: 'mindful',
      stance: 'mindful',
      locationContext: {
        name: 'Presidio Park Trail',
        source: 'manual',
      },
      tags: ['Breakthrough', 'Leadership'],
      summary:
        'During a long weekend walk, realized that effective leadership requires contract-first interfaces rather than synchronous micromanagement. Authored explicit software standards.',
      starred: true,
      isDemo: true,
      turns: [
        {
          id: 'turn-4-1',
          entryId: 'demo-entry-4',
          role: 'user',
          content:
            'Took a 2-hour walk through the park without my phone. It became crystal clear: I don’t need to watch over shoulders if the boundary contracts and design tokens are mathematically precise.',
          timestamp: subDays(9),
        },
        {
          id: 'turn-4-2',
          entryId: 'demo-entry-4',
          role: 'model',
          content:
            'Spaciousness allows the subconscious to untangle what frantic keyboard time knots together. Clear boundaries don’t restrict freedom; they liberate both you and your collaborators.',
          timestamp: subDays(9),
        },
      ],
    },
    {
      id: 'demo-entry-5',
      userId,
      title: 'Iterative Trajectory vs All-or-Nothing',
      createdAt: subDays(4),
      concludedAt: subDays(4),
      status: 'concluded',
      category: 'Strategy',
      mood: 'Reflective',
      mode: 'reflect',
      stance: 'reflect',
      locationContext: {
        name: 'Airport Terminal Gate B4',
        source: 'manual',
      },
      tags: ['Decision', 'Reflective'],
      summary:
        'Reframed the product launch as an ongoing longitudinal learning experiment rather than a permanent verdict on personal worth. Shifted focus from vanity metrics to depth of user reflection.',
      starred: false,
      isDemo: true,
      turns: [
        {
          id: 'turn-5-1',
          entryId: 'demo-entry-5',
          role: 'user',
          content:
            'Waiting for my flight. Thinking about the difference between shipping to impress an audience versus shipping to learn from authentic usage. The pressure evaporated when I chose the latter.',
          timestamp: subDays(4),
        },
        {
          id: 'turn-5-2',
          entryId: 'demo-entry-5',
          role: 'model',
          content:
            'That shift from performance to inquiry is the hallmark of sustainable mastery. You are no longer defending an ego; you are curious about what reality reveals.',
          timestamp: subDays(4),
        },
      ],
    },
    {
      id: 'demo-entry-6',
      userId,
      title: 'Month in Review: Clarity and Grounding',
      createdAt: subDays(0),
      status: 'active',
      category: 'Personal',
      mood: 'Grateful',
      mode: 'mindful',
      stance: 'mindful',
      locationContext: {
        name: 'Home Office, Morning Sun',
        source: 'manual',
      },
      tags: ['Breakthrough', 'Reflective'],
      summary:
        'Reflecting on the past 30 days. Noticing how initial launch anxiety and micromanagement shifted into calm execution, clear boundaries, and deep appreciation for daily contemplation.',
      starred: true,
      isDemo: true,
      turns: [
        {
          id: 'turn-6-1',
          entryId: 'demo-entry-6',
          role: 'user',
          content:
            "Looking back across the last month of notes, the shift is staggering. A month ago I was paralyzed by build configs. Today the system is running, the themes are connected, and I feel centered.",
          timestamp: subDays(0),
          isPinned: true,
          note: 'Evidence of measurable longitudinal shift in perspective.',
        },
        {
          id: 'turn-6-2',
          entryId: 'demo-entry-6',
          role: 'model',
          content:
            "You can literally read your own trajectory unfolding: from fear of exposure, to simplifying architecture, to loosening control through explicit standards. The progress was never linear, but it is unmistakable.",
          timestamp: subDays(0),
        },
      ],
    },
  ];

  // 2. Persistent Longitudinal Themes
  const themes: Theme[] = [
    {
      id: 'demo-theme-1',
      userId,
      title: 'Creative Crossroads & Scope Discipline',
      currentSynthesis:
        'Transitioning from tool hyper-optimization to direct execution focus. Recognizing perfectionism as hidden procrastination and adopting strict interface boundaries.',
      observationCount: 3,
      createdAt: subDays(30),
      updatedAt: subDays(4),
      isDemo: true,
    },
    {
      id: 'demo-theme-2',
      userId,
      title: 'Engineering Leadership & Delegation',
      currentSynthesis:
        'Evolving from defensive micromanagement to clear contract-first delegation. Quality is maintained through explicit tokens and standards, not synchronous hovering.',
      observationCount: 3,
      createdAt: subDays(16),
      updatedAt: subDays(0),
      isDemo: true,
    },
    {
      id: 'demo-theme-3',
      userId,
      title: 'Rhythm, Energy & Spaciousness',
      currentSynthesis:
        'Learning that cognitive stamina correlates with daily walking and mental spaciousness. Friction arises when artificial urgency replaces calm intentionality.',
      observationCount: 2,
      createdAt: subDays(23),
      updatedAt: subDays(0),
      isDemo: true,
    },
  ];

  // 3. Discrete, Immutable Theme Observations
  const observations: ThemeObservation[] = [
    {
      id: 'demo-obs-1',
      userId,
      entryId: 'demo-entry-1',
      themeId: 'demo-theme-1',
      observationText:
        'Confronted creative paralysis; recognized tool tinkering as an emotional buffer against shipping.',
      timestamp: subDays(30),
      locationSnapshot: 'Home Office, Desk',
    },
    {
      id: 'demo-obs-2',
      userId,
      entryId: 'demo-entry-2',
      themeId: 'demo-theme-1',
      observationText:
        'Discovered momentum by cutting auxiliary workers and standardizing on clean OOUX contracts.',
      timestamp: subDays(23),
      locationSnapshot: 'The Mill Coffee, SF',
    },
    {
      id: 'demo-obs-3',
      userId,
      entryId: 'demo-entry-5',
      themeId: 'demo-theme-1',
      observationText:
        'Reframed launch as an exploratory learning loop rather than an all-or-nothing ego test.',
      timestamp: subDays(4),
      locationSnapshot: 'Airport Terminal Gate B4',
    },
    {
      id: 'demo-obs-4',
      userId,
      entryId: 'demo-entry-3',
      themeId: 'demo-theme-2',
      observationText:
        'Identified task-hoarding and personal review bottlenecks as fear of quality loss.',
      timestamp: subDays(16),
      locationSnapshot: 'Home Office, Late Night',
    },
    {
      id: 'demo-obs-5',
      userId,
      entryId: 'demo-entry-4',
      themeId: 'demo-theme-2',
      observationText:
        'Replaced synchronous hovering with explicit design tokens and boundary contracts.',
      timestamp: subDays(9),
      locationSnapshot: 'Presidio Park Trail',
    },
    {
      id: 'demo-obs-6',
      userId,
      entryId: 'demo-entry-6',
      themeId: 'demo-theme-2',
      observationText:
        'Observed successful team velocity without personal burnout; verified delegation stability.',
      timestamp: subDays(0),
      locationSnapshot: 'Home Office, Morning Sun',
    },
    {
      id: 'demo-obs-7',
      userId,
      entryId: 'demo-entry-2',
      themeId: 'demo-theme-3',
      observationText:
        'Physical shift to a vibrant environment restored agency and cognitive spaciousness.',
      timestamp: subDays(23),
      locationSnapshot: 'The Mill Coffee, SF',
    },
    {
      id: 'demo-obs-8',
      userId,
      entryId: 'demo-entry-4',
      themeId: 'demo-theme-3',
      observationText:
        'Phoneless 2-hour walk allowed subconscious processing to untangle leadership dilemmas.',
      timestamp: subDays(9),
      locationSnapshot: 'Presidio Park Trail',
    },
  ];

  return { entries, themes, observations };
}
