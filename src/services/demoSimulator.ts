import { Entry, Theme, ThemeObservation } from '../types';

export const DEMO_USER_ID = 'demo-evaluator';

/**
 * AUTHENTIC STUDENT PERSONA DEMO DATASET ("First Month Away From Home")
 * Generated chronologically through the real Locus AI companion and synchronous synthesis pipeline.
 * Fully aligned with Locus-Demo-Data-Brief.md & Locus-Demo-Agent-Plan.md.
 */
export function getSampleDemoDataset(userId: string = DEMO_USER_ID): {
  entries: Entry[];
  themes: Theme[];
  observations: ThemeObservation[];
} {
  const now = new Date();
  const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const entries: Entry[] = [
  {
    "id": "demo-entry-1",
    "userId": "demo-evaluator",
    "title": "Move-In Day & 400-Person Lecture Halls",
    "createdAt": subDays(28),
    "concludedAt": subDays(28),
    "bodySealedAt": subDays(28),
    "status": "concluded",
    "category": "Life",
    "mood": "Overwhelmed",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-1-1",
        "entryId": "demo-entry-1",
        "role": "user",
        "content": "I don't know where to start. Move-in was pure chaos and my parents left three hours ago.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-2",
        "entryId": "demo-entry-1",
        "role": "model",
        "content": "You are standing in the quiet aftermath of a storm, surrounded by physical clutter while the emotional weight of their departure begins to settle in. It is disorienting to transition so abruptly from the frantic, shared energy of moving to the sudden, heavy silence of being on your own. Right now, this space probably feels less like a home and more like an overwhelming threshold you aren't quite ready to cross.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-3",
        "entryId": "demo-entry-1",
        "role": "user",
        "content": "My roommate Sarah seems nice, but she's already blasted music without headphones and had two friends over without asking.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-4",
        "entryId": "demo-entry-1",
        "role": "model",
        "content": "You are trying to find your footing in a brand-new chapter, but the boundaries of your sanctuary have been breached before the dust has even settled. There is a delicate, exhausting tension between wanting to keep the peace with a new roommate and needing to protect your own space to breathe. It feels like you're being forced to negotiate your comfort before you've even had a chance to unpack.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-5",
        "entryId": "demo-entry-1",
        "role": "user",
        "content": "I walked into Chemistry today and there were literally 400 people in one amphitheater. I felt completely invisible.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-6",
        "entryId": "demo-entry-1",
        "role": "model",
        "content": "Shrinking into a sea of four hundred strangers can make your own existence feel suddenly fragile and overlooked. In a room that massive, the quiet hope of finding your place is easily swallowed up by a cold sense of anonymity. It is deeply disorienting to realize that the hardest part of this transition might not be the academic challenge, but the sudden loss of being known.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-7",
        "entryId": "demo-entry-1",
        "role": "user",
        "content": "I'm sitting here in this tiny twin-XL bed listening to the hallway screaming and wishing I was back in my own bedroom.",
        "timestamp": subDays(28)
      },
      {
        "id": "turn-1-8",
        "entryId": "demo-entry-1",
        "role": "model",
        "content": "The contrast between the loud, chaotic world outside your door and the confines of that tiny bed can make home feel painfully distant. It is a quiet ache—craving the effortless sanctuary of your old life while feeling utterly ungrounded in this unfamiliar environment. Right now, you aren't just missing a bedroom; you are longing for a space where you don't have to work so hard just to feel safe and at ease.",
        "timestamp": subDays(28)
      }
    ],
    "stratumCount": 2,
    "returnCount": 0,
    "isDemo": true,
    "summary": "The abrupt transition to independence manifests not as an academic challenge, but as an acute loss of boundary, sanctuary, and personal visibility. Confronted by physical chaos, shared-space friction, and mass anonymity, the primary emotional strain stems from the continuous energy now required simply to feel safe and grounded. Ultimately, the ache for home represents a deep longing for an environment where identity and ease do not have to be constantly negotiated."
  },
  {
    "id": "demo-entry-2",
    "userId": "demo-evaluator",
    "title": "Chem Problem Sets & Campus Radio",
    "createdAt": subDays(26),
    "concludedAt": subDays(26),
    "bodySealedAt": subDays(26),
    "status": "concluded",
    "category": "Academics",
    "mood": "Anxious",
    "stance": "brainstorm",
    "turns": [
      {
        "id": "turn-2-1",
        "entryId": "demo-entry-2",
        "role": "user",
        "content": "Looked at the first Chem problem set and I swear half the symbols weren't in my high school textbook.",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-2",
        "entryId": "demo-entry-2",
        "role": "model",
        "content": "That sudden shift in notation usually signals you're moving from descriptive chemistry into modeling the actual physics underneath. Treat those unfamiliar symbols less like a wall and more like a set of compressed shortcuts designed to make complex relationships easier to manipulate once you have the key. Is there one specific symbol that feels particularly alien, or is it the sheer density of the new language all at once?",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-3",
        "entryId": "demo-entry-2",
        "role": "user",
        "content": "I ended up walking through the student quad during the club fair just to escape my desk.",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-4",
        "entryId": "demo-entry-2",
        "role": "model",
        "content": "Stepping away like that isn't just avoidance; it's a necessary circuit breaker when your brain hits a saturation point with new notation. Walking into the noise of the quad offers a complete sensory reset, reminding you that your world right now is much broader than a single problem set. Did any particular group catch your attention while you were out there, or was the crowd itself the main antidote?",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-5",
        "entryId": "demo-entry-2",
        "role": "user",
        "content": "Put my name down on a clipboard for the campus radio station. I had no idea what to say, so I just nodded and ran off.",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-6",
        "entryId": "demo-entry-2",
        "role": "model",
        "content": "There’s a great instinct in signing your name before your brain has time to talk you out of it. Radio is a fascinating counterweight to chemistry—trading rigid, unfamiliar symbols for raw voice, music, and spontaneous connection. What drew you to that specific table—were you imagining running a late-night show, or was it just a purely spontaneous leap?",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-7",
        "entryId": "demo-entry-2",
        "role": "user",
        "content": "I keep oscillating between wanting to hide in my room and forcing myself to look like I know what I'm doing.",
        "timestamp": subDays(26)
      },
      {
        "id": "turn-2-8",
        "entryId": "demo-entry-2",
        "role": "model",
        "content": "That pendulum swing between retreat and performance is exhausting because both roles take so much energy. What if the middle ground is simply allowing yourself to be a beginner at both chemistry and radio, without needing to master the look of it yet?",
        "timestamp": subDays(26)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Encountering an unfamiliar academic paradigm triggers an instinctive retreat from intellectual overload. Stepping away via spontaneous action breaks the exhaustion of alternating between isolation and performance. The core realization lies in relinquishing the pressure of mastery, allowing the permission simply to be a beginner."
  },
  {
    "id": "demo-entry-3",
    "userId": "demo-evaluator",
    "title": "Empty Dorm & Cold Dining Hall Pasta",
    "createdAt": subDays(24),
    "concludedAt": subDays(24),
    "bodySealedAt": subDays(24),
    "status": "concluded",
    "category": "Personal",
    "mood": "Lonely",
    "stance": "mindful",
    "turns": [
      {
        "id": "turn-3-1",
        "entryId": "demo-entry-3",
        "role": "user",
        "content": "Sarah went out to some party with people from her high school. I ate dinner by myself at the dining hall—cold pasta and a lukewarm iced tea while staring at my phone. The quiet in this dorm room is somehow louder than the music was on Tuesday. I miss the kitchen noise at home.",
        "timestamp": subDays(24)
      },
      {
        "id": "turn-3-2",
        "entryId": "demo-entry-3",
        "role": "model",
        "content": "That silence has a physical weight to it, pressing against the walls where familiar voices used to live. An empty dorm room sharpens the contrast of displacement, and the clatter of home cannot be quickly replaced. Acknowledging that quiet ache is the first step in letting this new space slowly take shape.",
        "timestamp": subDays(24)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "The physical isolation of the empty dorm room sharpens the contrast of Sarah’s social absence, amplifying the grief of displacement. A profound realization emerges: the jarring silence of solitary spaces carries a heavier, more resonant weight than the familiar comfort of a distant home."
  },
  {
    "id": "demo-entry-4",
    "userId": "demo-evaluator",
    "title": "Sunday Phone Call with Mom",
    "createdAt": subDays(22),
    "concludedAt": subDays(22),
    "bodySealedAt": subDays(22),
    "status": "concluded",
    "category": "Family",
    "mood": "Grounded",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-4-1",
        "entryId": "demo-entry-4",
        "role": "user",
        "content": "Called Mom this afternoon and talked for almost an hour while sitting on the grass outside the library. She asked about the food and told me the dog kept sleeping in my empty room. I almost started tearing up in public, but hearing her laugh made everything feel a tiny bit more survivable.",
        "timestamp": subDays(22)
      },
      {
        "id": "turn-4-2",
        "entryId": "demo-entry-4",
        "role": "model",
        "content": "There is a quiet grounding in letting an hour drift by like that, tethered only to the sound of her voice and the open grass. That laughter doesn't erase the distance, but it gently reminds you that home is an enduring anchor you carry within yourself.",
        "timestamp": subDays(22)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "An unhurried connection across physical distance surfaced the subtle emotional weight of living away, illuminated by small reminders that home still holds space for your presence. In a moment of quiet public vulnerability, the familiar anchor of a mother's laughter provided a crucial pivot, transforming an overwhelming strain into a manageable, steadying endurance."
  },
  {
    "id": "demo-entry-5",
    "userId": "demo-evaluator",
    "title": "First Chemistry Quiz: 48%",
    "createdAt": subDays(20),
    "concludedAt": subDays(20),
    "bodySealedAt": subDays(20),
    "status": "concluded",
    "category": "Academics",
    "mood": "Distressed",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-5-1",
        "entryId": "demo-entry-5",
        "role": "user",
        "content": "Got back our first Chem quiz today. Forty-eight percent.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-2",
        "entryId": "demo-entry-5",
        "role": "model",
        "content": "A score like that right out of the gate can feel like a cold shock, pulling the rug out from under your expectations for the term. It creates a heavy, disorienting space between the effort you put in and the daunting reality staring back at you from the page. Sitting with a result that stark carries a very specific, unsettling weight.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-3",
        "entryId": "demo-entry-5",
        "role": "user",
        "content": "I stared at the red ink at the top of the paper and my stomach completely dropped.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-4",
        "entryId": "demo-entry-5",
        "role": "model",
        "content": "That physical sinking is the exact moment disappointment turns into pure dread, freezing you right where you sit. The red ink makes the outcome feel sudden, loud, and brutally absolute, as if it's calling into question your capability in an instant. It leaves you stranded in that quiet panic before your mind even begins to figure out what comes next.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-5",
        "entryId": "demo-entry-5",
        "role": "user",
        "content": "I've never gotten below a B in my life. Everyone walking out of the lecture hall was laughing and comparing answers, and I just stuffed it in my backpack.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-6",
        "entryId": "demo-entry-5",
        "role": "model",
        "content": "Hiding that paper away marks a painful rupture in a self-image built on always succeeding, turning a single result into a private burden. When high marks have always been your baseline, the casual noise of everyone else only sharpens the deep isolation of the moment. It leaves you carrying an unfamiliar, heavy weight completely alone while the rest of the world seems to move on untouched.",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-7",
        "entryId": "demo-entry-5",
        "role": "user",
        "content": "What if I'm fundamentally not cut out for this major?",
        "timestamp": subDays(20)
      },
      {
        "id": "turn-5-8",
        "entryId": "demo-entry-5",
        "role": "model",
        "content": "That leap from a bad quiz to a total questioning of your potential is where the deepest panic sits. When success has always been your normal, a sudden failure can make you feel like an imposter in your own life, threatening the entire path you've envisioned for yourself. It is a profoundly destabilizing place to be, watching a single mark shake your faith in who you are.",
        "timestamp": subDays(20)
      }
    ],
    "stratumCount": 1,
    "returnCount": 0,
    "openThreads": [
      "How do I study for a college STEM exam when high school habits fail?"
    ],
    "isDemo": true,
    "summary": "An unprecedented academic failure created a visceral rupture in a self-image long defined by consistent achievement. The impulse to conceal the result underscores how deeply personal worth was tethered to performance, turning an objective mark into an isolating burden. Consequently, this initial shock catalyzed a rapid shift from processing a temporary setback to questioning fundamental capability and future path."
  },
  {
    "id": "demo-entry-6",
    "userId": "demo-evaluator",
    "title": "Library Study Group with Priya",
    "createdAt": subDays(18),
    "concludedAt": subDays(18),
    "bodySealedAt": subDays(18),
    "status": "concluded",
    "category": "Academics",
    "mood": "Cautious",
    "stance": "actionable",
    "turns": [
      {
        "id": "turn-6-1",
        "entryId": "demo-entry-6",
        "role": "user",
        "content": "Stayed after lecture today and talked to a girl named Priya sitting two rows down.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-2",
        "entryId": "demo-entry-6",
        "role": "model",
        "content": "That took a quiet kind of courage—stepping across those two rows to turn a shared space into a real connection. Take a moment to appreciate yourself for taking that leap, regardless of where it leads. The next time you sit in that lecture, a simple, warm smile or hello is all it takes to keep that door gently open.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-3",
        "entryId": "demo-entry-6",
        "role": "user",
        "content": "Turns out she also struggled with the equilibrium problem on the quiz.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-4",
        "entryId": "demo-entry-6",
        "role": "model",
        "content": "Finding out you aren't the only one tangled up in that equilibrium problem is such a sweet relief, turning a private struggle into a shared human moment. Next time you see her, you could casually mention if you figured it out or just laugh about how tricky it was—it's an easy, natural bridge. Be proud of yourself for creating that little spark of camaraderie where there used to just be empty rows.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-5",
        "entryId": "demo-entry-6",
        "role": "user",
        "content": "We decided to meet at the library annex tomorrow to work through the practice set together. Gave Priya my number, 555-0148, for the study group chat.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-6",
        "entryId": "demo-entry-6",
        "role": "model",
        "content": "Look at you building a bridge from a single question to an actual study partner, all through trusting your own quiet courage. For tomorrow, just show up as you are—maybe grab two coffees or secure a quiet corner table together—and remember you're just two people figuring out physics side-by-side. You've already done the hardest part by reaching out, so let yourself simply enjoy the momentum of making a new connection.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-7",
        "entryId": "demo-entry-6",
        "role": "user",
        "content": "It feels terrifying to admit out loud that I need help, but sitting alone failing isn't working.",
        "timestamp": subDays(18)
      },
      {
        "id": "turn-6-8",
        "entryId": "demo-entry-6",
        "role": "model",
        "content": "That vulnerability takes real bravery to admit, especially when it feels so much safer to struggle in silence. Acknowledging that you don't have to carry it all by yourself is a profound gift of self-compassion. Tomorrow, when you sit down with Priya, remember that needing help doesn't diminish you—it's simply the door through which we find connection.",
        "timestamp": subDays(18)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Initiating contact across physical distance transformed isolated academic struggle into shared human connection. Embracing the vulnerability of needing help dismantled the barrier of silence, turning a moment of difficulty into a collaborative partnership."
  },
  {
    "id": "demo-entry-7",
    "userId": "demo-evaluator",
    "title": "Alarm Snoozing & Dorm Friction",
    "createdAt": subDays(16),
    "concludedAt": subDays(16),
    "bodySealedAt": subDays(16),
    "status": "concluded",
    "category": "Life",
    "mood": "Frustrated",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-7-1",
        "entryId": "demo-entry-7",
        "role": "user",
        "content": "Sarah hit snooze on her 6:30 AM alarm four times today. I finally snapped and asked if she could just wake up on the first chime. She gave me this cold, defensive glare, and the rest of the evening was thick, awful silence. I hate confrontation, but living with a stranger is exhausting.",
        "timestamp": subDays(16)
      },
      {
        "id": "turn-7-2",
        "entryId": "demo-entry-7",
        "role": "model",
        "content": "In that narrow morning hallway between sleep and waking, two separate strains collided. That lingering silence isn't just about an alarm clock; it is the friction of two people trying to protect their fragile sense of peace in a room that feels too small for both.",
        "timestamp": subDays(16)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Morning friction and defensive reactions exposed a deeper mutual exhaustion, turning the shared home into a space of cautious isolation. The underlying dread of confrontation traps both individuals in a cycle of silent estrangement, where the longing for intimacy is overshadowed by the fear of unmanaged tension."
  },
  {
    "id": "demo-entry-8",
    "userId": "demo-evaluator",
    "title": "Flex Dollars & Textbook Budgeting",
    "createdAt": subDays(14),
    "concludedAt": subDays(14),
    "bodySealedAt": subDays(14),
    "status": "concluded",
    "category": "Personal",
    "mood": "Stressed",
    "stance": "actionable",
    "turns": [
      {
        "id": "turn-8-1",
        "entryId": "demo-entry-8",
        "role": "user",
        "content": "Checked my dining card balance today and I've already spent half my semester flex dollars. Between iced coffees and that surprise $140 chemistry lab manual, I'm burning through savings way too fast. Called Dad to ask about textbook rentals, but I hated having to ask. Need to figure out how to cook basic meals in the floor lounge.",
        "timestamp": subDays(14)
      },
      {
        "id": "turn-8-2",
        "entryId": "demo-entry-8",
        "role": "model",
        "content": "Unexpected textbook costs have a way of disrupting even careful intentions. Moving toward cooking in the floor lounge is a practical reclaim of agency—starting with one or two simple comfort meals will give you both financial breathing room and a grounding daily rhythm.",
        "timestamp": subDays(14)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Unexpected academic expenses and initial miscalculations in lifestyle spending quickly depleted early-semester funds. Recognizing this friction, the user shifted from the discomfort of relying on financial support toward personal agency by planning to cook basic meals and recalibrate daily habits."
  },
  {
    "id": "demo-entry-9",
    "userId": "demo-evaluator",
    "title": "Radio Station Interest Meeting",
    "createdAt": subDays(12),
    "concludedAt": subDays(12),
    "bodySealedAt": subDays(12),
    "status": "concluded",
    "category": "Community",
    "mood": "Nervous",
    "stance": "brainstorm",
    "turns": [
      {
        "id": "turn-9-1",
        "entryId": "demo-entry-9",
        "role": "user",
        "content": "Went to the campus radio interest meeting down in the student union basement.",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-2",
        "entryId": "demo-entry-9",
        "role": "model",
        "content": "Basement studios often harbor the most genuine creative energy on campus precisely because they are cut off from the noise upstairs. What kind of signal or sound felt like it was waiting down there for you?",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-3",
        "entryId": "demo-entry-9",
        "role": "user",
        "content": "Everyone there seemed so effortlessly cool and older, talking about underground indie labels I've never heard of.",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-4",
        "entryId": "demo-entry-9",
        "role": "model",
        "content": "That initial intimidation is usually just proximity to people who have spent an extra year or two obsessing over a niche. The beauty of radio is that a microphone doesn't care who is \"cool\"—it only cares about what you're curious enough to investigate. What is one sound or genre you actually love that no one in that room has claimed yet?",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-5",
        "entryId": "demo-entry-9",
        "role": "user",
        "content": "I almost sneaked out the side door, but the music director asked if anyone wanted a 2 AM Sunday graveyard shadow shift.",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-6",
        "entryId": "demo-entry-9",
        "role": "model",
        "content": "That shift is essentially an empty canvas where nobody is listening and everyone is dreaming, which makes it the ultimate laboratory for finding your voice. Taking it means trading a normal sleep schedule for total creative autonomy when the rest of the world goes quiet. What would you play for the ghosts at three in the morning?",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-7",
        "entryId": "demo-entry-9",
        "role": "user",
        "content": "My hand went up before my brain could stop me. Guess I'm doing late-night radio.",
        "timestamp": subDays(12)
      },
      {
        "id": "turn-9-8",
        "entryId": "demo-entry-9",
        "role": "model",
        "content": "That involuntary reflex is usually your intuition making the choice your hesitation was trying to talk you out of. You just accidentally signed up for the most honest classroom on campus.",
        "timestamp": subDays(12)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Initial intimidation by niche cultural authority dissolves when faced with an empty creative canvas. An impulsive commitment to a marginalized, solitary late-night shift bypasses self-doubt to secure total artistic autonomy. Intuition has chosen the ultimate, unobserved laboratory for developing an authentic voice."
  },
  {
    "id": "demo-entry-10",
    "userId": "demo-evaluator",
    "title": "Friday Night Stairwell Relapse",
    "createdAt": subDays(10),
    "concludedAt": subDays(10),
    "bodySealedAt": subDays(10),
    "status": "concluded",
    "category": "Personal",
    "mood": "Despondent",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-10-1",
        "entryId": "demo-entry-10",
        "role": "user",
        "content": "Thought I was past this, but tonight it hit me like a truck all over again.",
        "timestamp": subDays(10)
      },
      {
        "id": "turn-10-2",
        "entryId": "demo-entry-10",
        "role": "model",
        "content": "That sudden, crushing wave can make all your progress feel entirely erased in a single second. It is deeply exhausting to realize that healing isn't a straight line, but rather a circle you sometimes find yourself looping back through when you least expect it.",
        "timestamp": subDays(10)
      },
      {
        "id": "turn-10-3",
        "entryId": "demo-entry-10",
        "role": "user",
        "content": "Friday night, everyone is going out, and I ended up crying in the stairwell between floors 3 and 4.",
        "timestamp": subDays(10)
      },
      {
        "id": "turn-10-4",
        "entryId": "demo-entry-10",
        "role": "model",
        "content": "The stark contrast between the world moving forward outside your door and the heavy, isolated reality you are sitting with in that concrete stairwell is profoundly lonely. It takes a quiet kind of courage to hold space for your own pain in the in-between places while everyone else is pretending the hurt doesn't exist.",
        "timestamp": subDays(10)
      },
      {
        "id": "turn-10-5",
        "entryId": "demo-entry-10",
        "role": "user",
        "content": "It feels like two weeks of small progress just evaporated. I just want my own bed, my own kitchen, and people who know me.",
        "timestamp": subDays(10)
      },
      {
        "id": "turn-10-6",
        "entryId": "demo-entry-10",
        "role": "model",
        "content": "That yearning for the sanctuary of your own familiar spaces and people who truly know your bones is a deep, aching call for safety. When the ground beneath you suddenly gives way, it makes complete sense that you just want to retreat to the places where you don't have to pretend you are okay.",
        "timestamp": subDays(10)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Healing is revealed not as a linear upward climb, but as a recursive loop where sudden regression can invalidate perceived progress. Amidst the isolating contrast of a moving world, the acute pain of relapse exposes a fundamental yearning for the safety of familiar ground and unmasked belonging."
  },
  {
    "id": "demo-entry-11",
    "userId": "demo-evaluator",
    "title": "Reading Invisible Cities in the Stacks",
    "createdAt": subDays(8),
    "concludedAt": subDays(8),
    "bodySealedAt": subDays(8),
    "status": "concluded",
    "category": "Philosophy",
    "mood": "Pensive",
    "stance": "mindful",
    "turns": [
      {
        "id": "turn-11-1",
        "entryId": "demo-entry-11",
        "role": "user",
        "content": "Pulled a battered paperback of Calvino's Invisible Cities off a shelf in the deep library stacks this afternoon. Read the passage about cities where travelers arrive and find their own pasts waiting on the street corners. It made me realize how much of a new place is just projecting who you think you're supposed to become onto strange brick buildings.",
        "timestamp": subDays(8)
      },
      {
        "id": "turn-11-2",
        "entryId": "demo-entry-11",
        "role": "model",
        "content": "That realization carries a sudden, clarifying stillness. It’s a vulnerable thing to recognize that the city's architecture is serving as a blueprint for a self you haven't quite met yet—turning foreign streets into an arena for quiet self-creation.",
        "timestamp": subDays(8)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "We often mistake the unfamiliar for a canvas, projecting our intended futures onto new environments to bridge the gap between who we were and who we aim to become. This realization reveals that our search for place is less about discovery and more about the vulnerable architecture of self-creation."
  },
  {
    "id": "demo-entry-12",
    "userId": "demo-evaluator",
    "title": "Midnight Instant Noodles with Sarah",
    "createdAt": subDays(7),
    "concludedAt": subDays(7),
    "bodySealedAt": subDays(7),
    "status": "concluded",
    "category": "Life",
    "mood": "Relieved",
    "stance": "reflect",
    "turns": [
      {
        "id": "turn-12-1",
        "entryId": "demo-entry-12",
        "role": "user",
        "content": "Midnight instant noodles in the dorm room with Sarah.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-2",
        "entryId": "demo-entry-12",
        "role": "model",
        "content": "The steam rising between you creates a fragile, quiet sanctuary that feels miles away from the chaos of the outside world. There is a profound intimacy in sharing this mundane ritual, as if the silence between bites holds the unspoken weight of everything you’re both trying to navigate together.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-3",
        "entryId": "demo-entry-12",
        "role": "user",
        "content": "She failed a communications quiz and I talked about my 48% in Chemistry. We ended up laughing until our stomachs hurt.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-4",
        "entryId": "demo-entry-12",
        "role": "model",
        "content": "That laughter was less about the absurdity of your grades and more about the sudden, desperate relief of realizing you aren't carrying your failures in isolation. In the glow of the dorm lights, the sting of those numbers dissolved into a shared language of vulnerability that made the academic weight feel momentarily weightless.",
        "timestamp": subDays(7),
        "isBookmarked": true,
        "isPinned": true,
        "note": "Breakthrough with Sarah: real connection happens when pretense drops."
      },
      {
        "id": "turn-12-5",
        "entryId": "demo-entry-12",
        "role": "user",
        "content": "She admitted she's been terrified of being here too, and was blasting music on day one because quiet made her anxious.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-6",
        "entryId": "demo-entry-12",
        "role": "model",
        "content": "It is striking how her bravado was actually a barricade against the crushing silence of a new life. By letting you see that fear, she has transformed your shared space from a mere room into a sanctuary where you can finally stop performing confidence and simply exist in your common uncertainty.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-7",
        "entryId": "demo-entry-12",
        "role": "user",
        "content": "We finally talked like two human beings instead of defensive roommates.",
        "timestamp": subDays(7)
      },
      {
        "id": "turn-12-8",
        "entryId": "demo-entry-12",
        "role": "model",
        "content": "The armor you both wore to protect your insecurities has finally been set aside, revealing the genuine people who were hiding behind that initial guardedness. You’ve moved past the performance of cohabitation into the rare, grounding comfort of being truly seen by someone else in the middle of your own transition.",
        "timestamp": subDays(7)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "starred": true,
    "isDemo": true,
    "summary": "The shared admission of academic and personal vulnerability dismantled the defensive performance required by your new environment. By replacing guardedness with mutual transparency, you transformed a hollow living arrangement into a grounding sanctuary of genuine human connection."
  },
  {
    "id": "demo-entry-13",
    "userId": "demo-evaluator",
    "title": "Professor Chen Office Hours & Stoichiometry",
    "createdAt": subDays(5),
    "concludedAt": subDays(5),
    "bodySealedAt": subDays(5),
    "status": "concluded",
    "category": "Academics",
    "mood": "Encouraged",
    "stance": "actionable",
    "turns": [
      {
        "id": "turn-13-1",
        "entryId": "demo-entry-13",
        "role": "user",
        "content": "Went to Professor Chen's office hours with Priya this morning. I was dreading it, but she walked us through stoichiometry on her whiteboard without making me feel stupid for a second. Also survived my 2 AM radio shadow shift last night. I actually solved three practice exam problems completely on my own tonight.",
        "timestamp": subDays(5)
      },
      {
        "id": "turn-13-2",
        "entryId": "demo-entry-13",
        "role": "model",
        "content": "There is profound relief when academic dread dissolves into human patience and genuine comprehension. Holding space through both a late-night broadcast and morning office hours shows quiet, steady momentum taking root—let yourself fully absorb that capability tonight.",
        "timestamp": subDays(5)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Academic dread dissolves through an unexpected moment of intellectual safety, clearing the way for genuine self-reliance. Solitary stillness on the night shift balances the vulnerability of peer collaboration, culminating in quiet, hard-earned momentum."
  },
  {
    "id": "demo-entry-14",
    "userId": "demo-evaluator",
    "title": "Weekend Visit Home & Mom Chicken Soup",
    "createdAt": subDays(3),
    "concludedAt": subDays(3),
    "bodySealedAt": subDays(3),
    "status": "concluded",
    "category": "Family",
    "mood": "Peaceful",
    "stance": "mindful",
    "locationContext": {
      "name": "Suburban Chicago, IL",
      "source": "manual"
    },
    "turns": [
      {
        "id": "turn-14-1",
        "entryId": "demo-entry-14",
        "role": "user",
        "content": "Took the regional train home for the weekend. The smell of our kitchen when I opened the back door was overwhelming in the best way. Ate my mom's chicken soup and fell asleep on the living room rug by 8:30 PM. It's comforting to know this anchor is still here, but strange to realize I'm already thinking about my desk back on campus.",
        "timestamp": subDays(3)
      },
      {
        "id": "turn-14-2",
        "entryId": "demo-entry-14",
        "role": "model",
        "content": "There is a profound somatic shift that happens when the train rhythm gives way to the familiar scent of home. Falling asleep on the rug is a cellular permission to put down whatever weight you've been carrying; and the quiet tug of campus shows that both places are beginning to form the architecture of your life.",
        "timestamp": subDays(3)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "isDemo": true,
    "summary": "Returning home bypasses the mind entirely, offering the nervous system a cellular permission to finally lay down its accumulated weight. Yet, this deep sanctuary coexists with a lingering anticipation of tomorrow's duties. Acknowledging this tension allows one to rest fully in the present anchor, trusting that the present moment can hold both the comfort of where we are and the reality of where we must go."
  },
  {
    "id": "demo-entry-15",
    "userId": "demo-evaluator",
    "title": "Campus Dusk & Month in Review",
    "createdAt": subDays(1),
    "concludedAt": subDays(1),
    "bodySealedAt": subDays(1),
    "status": "concluded",
    "category": "Life",
    "mood": "Grateful",
    "stance": "mindful",
    "turns": [
      {
        "id": "turn-15-1",
        "entryId": "demo-entry-15",
        "role": "user",
        "content": "Walked back to the dorm across the quad just as the streetlights were turning on in the cold dusk.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-2",
        "entryId": "demo-entry-15",
        "role": "model",
        "content": "There is a quiet weight in that transition from day to night, feeling the chill settle into your coat as the world outside slows down. That threshold between the quad and your room offers a rare pause, a chance to let the day's noise fade into the hum of evening. It’s like stepping out of the current and finding a still place to simply breathe.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-3",
        "entryId": "demo-entry-15",
        "role": "user",
        "content": "Sarah texted: 'Made cheap ramen in the lounge, come grab a bowl before study session with Priya.'",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-4",
        "entryId": "demo-entry-15",
        "role": "model",
        "content": "A small, unexpected warmth cutting through the chill of the evening, offering an anchor of simple comfort right before the books open. That invitation is a quiet pause in the rush, a chance to let your shoulders drop in good company.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-5",
        "entryId": "demo-entry-15",
        "role": "user",
        "content": "Cooked cheap ramen to keep the budget alive, and it tasted better than any dining hall meal.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-6",
        "entryId": "demo-entry-15",
        "role": "model",
        "content": "There is a grounding satisfaction in finding richness in something so simple, letting the warmth of the broth chase away the dusk's chill. That shared, modest meal becomes a quiet refuge, anchoring you before the evening's demands begin.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-7",
        "entryId": "demo-entry-15",
        "role": "user",
        "content": "Four weeks ago I thought I had made the biggest mistake of my life coming here. It's still hard, but the ground under my feet doesn't feel like it's shaking anymore.",
        "timestamp": subDays(1)
      },
      {
        "id": "turn-15-8",
        "entryId": "demo-entry-15",
        "role": "model",
        "content": "There is a quiet power in feeling that shift from vertigo to solid earth beneath you, noticing how the daily storms have settled into something you can navigate. You’ve let the unfamiliarity soften just enough to find your footing, turning raw survival into a steady rhythm.",
        "timestamp": subDays(1)
      }
    ],
    "stratumCount": 0,
    "returnCount": 0,
    "starred": true,
    "isDemo": true,
    "summary": "The initial vertigo of a monumental life transition has quieted into solid footing through the accumulation of small, grounding rhythms. Simple comforts, like shared budget meals and unexpected invitations, act as anchors against the chill of unfamiliarity. Survival has quietly transitioned into a steady, navigable presence."
  }
];

  const themes: Theme[] = [
  {
    "id": "demo-theme-1",
    "userId": "demo-evaluator",
    "title": "The Strain of Environmental Anonymity",
    "currentSynthesis": "Navigating new, shared, or anonymous living spaces introduces a continuous tax on personal energy. Rather than facing purely cognitive or practical challenges, the individual experiences an acute loss of boundaries and sanctuary, turning daily existence into a persistent effort to feel grounded and visible.",
    "observationCount": 2,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-2",
    "userId": "demo-evaluator",
    "title": "Home as Unnegotiated Sanctuary",
    "currentSynthesis": "The longing for home often reflects a psychological need for environments where identity, safety, and ease are inherent rather than claimed. When surrounding environments require perpetual boundary maintenance, home becomes re-conceptualized as any space where one can exist without active defense or negotiation.",
    "observationCount": 9,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-3",
    "userId": "demo-evaluator",
    "title": "Grace in Beginner's Mind",
    "currentSynthesis": "The encounter with intellectual overload reveals the hidden cost of performance and the psychological friction of mastering unfamiliar domains. By relinquishing the demand for immediate competence and choosing spontaneous disengagement, one uncovers the liberating permission to simply be a beginner.",
    "observationCount": 2,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-4",
    "userId": "demo-evaluator",
    "title": "Vulnerability as Collaborative Bridge",
    "currentSynthesis": "The experience of isolation during academic or personal struggle often creates a self-imposed barrier of silence. By embracing vulnerability and acknowledging the need for help, isolation dissolves into shared human connection and meaningful collaborative partnership across distance.",
    "observationCount": 3,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-5",
    "userId": "demo-evaluator",
    "title": "Agency in Economic Friction",
    "currentSynthesis": "Encountering unexpected financial scarcity often triggers initial discomfort and reliance on external support. By pivoting toward practical self-reliance and habit recalibration, the individual reclaims personal agency over material constraints.",
    "observationCount": 1,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-6",
    "userId": "demo-evaluator",
    "title": "Sanctuary of the Unobserved Laboratory",
    "currentSynthesis": "Developing an authentic creative voice requires carving out spaces free from external gaze, cultural intimidation, and social performance. By embracing isolation and unconventional conditions, the individual secures total artistic autonomy and uninhibited exploration.",
    "observationCount": 2,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-7",
    "userId": "demo-evaluator",
    "title": "The Recursive Loop of Healing",
    "currentSynthesis": "Healing is not a linear upward trajectory, but a recursive loop where sudden regressions challenge the perception of progress. This cyclical nature exposes deep-seated vulnerabilities and an ongoing struggle between moving forward and retreating into familiar ground.",
    "observationCount": 1,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  },
  {
    "id": "demo-theme-8",
    "userId": "demo-evaluator",
    "title": "The Architecture of Self-Projection",
    "currentSynthesis": "The act of entering new environments serves as a psychological mechanism for self-actualization, where the unfamiliar is used as a mirror to project and test nascent identities. This process highlights that our physical surroundings are often subordinate to the internal need for a stage upon which to evolve.",
    "observationCount": 1,
    "createdAt": subDays(28),
    "updatedAt": subDays(1),
    "isDemo": true
  }
];

  const observations: ThemeObservation[] = [
  {
    "id": "demo-obs-1",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-1",
    "themeId": "demo-theme-1",
    "observationText": "The transition to independence is marked by an acute drain on emotional energy caused by mass anonymity and shared-space friction, forcing constant effort to establish basic safety and personal boundaries.",
    "timestamp": subDays(28)
  },
  {
    "id": "demo-obs-2",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-1",
    "themeId": "demo-theme-2",
    "observationText": "The ache for home represents a deep desire for an environment where personal identity and emotional ease do not require continuous effort or negotiation.",
    "timestamp": subDays(28)
  },
  {
    "id": "demo-obs-3",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-2",
    "themeId": "demo-theme-3",
    "observationText": "Prompted by the companion's reframing of chemical notation as compressed shortcuts rather than cognitive walls, the student replaced academic paralysis with exploratory curiosity, transforming an intimidating subject into a series of decodable keys.",
    "timestamp": subDays(26)
  },
  {
    "id": "demo-obs-4",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-3",
    "themeId": "demo-theme-2",
    "observationText": "The stark reality of an empty dorm room contrasts sharply with the longing for home, illustrating how the physical absence of familiar comfort intensifies the emotional weight of displacement.",
    "timestamp": subDays(24)
  },
  {
    "id": "demo-obs-5",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-4",
    "themeId": "demo-theme-2",
    "observationText": "Distance highlights the subtle weight of living away, yet simple touchpoints—like a mother's familiar laughter—reaffirm home as an enduring emotional anchor that transforms public vulnerability into grounded resilience.",
    "timestamp": subDays(22)
  },
  {
    "id": "demo-obs-6",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-5",
    "themeId": "demo-theme-3",
    "observationText": "Through conversational dialogue unpacking the shock of a 48% quiz score, the student separated academic metrics from core capability, realizing that high-stakes perfectionism was eclipsing the essential grace of a beginner's mind.",
    "timestamp": subDays(20)
  },
  {
    "id": "demo-obs-7",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-6",
    "themeId": "demo-theme-4",
    "observationText": "Prompted by the companion to translate silent dread into active inquiry, the student initiated contact with a classmate and attended office hours, discovering that academic transparency converts intimidating faculty into genuine intellectual allies.",
    "timestamp": subDays(18)
  },
  {
    "id": "demo-obs-8",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-7",
    "themeId": "demo-theme-2",
    "observationText": "The friction of defensive reactions and cautious isolation reveals how unmanaged tension turns the home from a sanctuary into a landscape of active estrangement, where the fear of confrontation eclipses the desire for intimacy.",
    "timestamp": subDays(16)
  },
  {
    "id": "demo-obs-9",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-8",
    "themeId": "demo-theme-5",
    "observationText": "Facing early-semester budget depletion catalyzed a shift from discomfort to personal accountability, turning financial friction into an exercise in lifestyle recalibration and self-sufficiency.",
    "timestamp": subDays(14)
  },
  {
    "id": "demo-obs-10",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-9",
    "themeId": "demo-theme-6",
    "observationText": "Following the companion's insight that curiosity matters more than outward poise, the student chose an isolated late-night radio shift, transforming an empty broadcast booth into an unobserved laboratory for creative growth.",
    "timestamp": subDays(12)
  },
  {
    "id": "demo-obs-11",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-10",
    "themeId": "demo-theme-2",
    "observationText": "The acute pain of relapse and regression highlights a profound yearning for the unnegotiated safety and unmasked belonging of true sanctuary.",
    "timestamp": subDays(10)
  },
  {
    "id": "demo-obs-12",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-10",
    "themeId": "demo-theme-7",
    "observationText": "Guided by the companion's gentle normalization of emotional regression, the student recognized that recovery is an iterative, recursive loop, reframing the stairwell relapse not as failure but as an organic beat of adaptation.",
    "timestamp": subDays(10)
  },
  {
    "id": "demo-obs-13",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-11",
    "themeId": "demo-theme-2",
    "observationText": "The entry reframes the search for sanctuary not as a passive discovery of place, but as an active, performative act of self-construction within new environments.",
    "timestamp": subDays(8)
  },
  {
    "id": "demo-obs-14",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-11",
    "themeId": "demo-theme-8",
    "observationText": "The individual recognizes that their displacement is a deliberate, albeit vulnerable, strategy to bridge the gap between their past self and their future aspirations.",
    "timestamp": subDays(8)
  },
  {
    "id": "demo-obs-15",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-12",
    "themeId": "demo-theme-2",
    "observationText": "Synthesizing the companion's bookmarked insight that closeness begins when pretense drops, the shared vulnerability of instant noodles and confessed quiz fears converted a tense living space into an authentic sanctuary.",
    "timestamp": subDays(7)
  },
  {
    "id": "demo-obs-16",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-12",
    "themeId": "demo-theme-4",
    "observationText": "Dialogue with the companion catalyzed the realization that defensive posturing had masked mutual isolation, allowing vulnerability to serve as a collaborative bridge that grounded a lasting friendship.",
    "timestamp": subDays(7)
  },
  {
    "id": "demo-obs-17",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-13",
    "themeId": "demo-theme-4",
    "observationText": "The friction of academic dread is temporarily neutralized through the surprising reassurance of intellectual safety, transforming isolated vulnerability into a stepping stone toward self-reliance.",
    "timestamp": subDays(5)
  },
  {
    "id": "demo-obs-18",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-13",
    "themeId": "demo-theme-6",
    "observationText": "The solitary rhythm of the night shift provides a necessary counterweight to the vulnerability of peer collaboration, creating an unobserved space where quiet momentum can take root.",
    "timestamp": subDays(5)
  },
  {
    "id": "demo-obs-19",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-14",
    "themeId": "demo-theme-2",
    "observationText": "The physical return home acts as a profound somatic reset, allowing the nervous system to fully relinquish accumulated tension while still holding space for future obligations.",
    "timestamp": subDays(3),
    "locationSnapshot": "Suburban Chicago, IL"
  },
  {
    "id": "demo-obs-20",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-15",
    "themeId": "demo-theme-1",
    "observationText": "The initial weight of environmental anonymity and vertigo has begun to lift, replaced by intentional grounding through micro-rhythms and simple communal anchors.",
    "timestamp": subDays(1)
  },
  {
    "id": "demo-obs-21",
    "userId": "demo-evaluator",
    "entryId": "demo-entry-15",
    "themeId": "demo-theme-2",
    "observationText": "Sanctuary is actively constructed not through grand stabilization, but through the accumulation of small, unpretentious comforts and shared routines that neutralize the chill of unfamiliarity.",
    "timestamp": subDays(1)
  }
];

  return { entries, themes, observations };
}
