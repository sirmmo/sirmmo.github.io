---
title: "The Lever, Not the Engine"
date: 2026-06-29
draft: false
subtitle: "Why LLMs are quietly making vendor lock-in a bad business decision"
canonical: "https://ingmmo.com/thesis/the-lever/"

# Homepage manifesto teaser. Auto-generated to match the essay; edit freely.
summary_lede: "For thirty years, lock-in was just math: connecting two systems was expensive, so walling off your data paid. Large language models quietly broke that math — they're not the engine that does the work but the lever that makes connection nearly free, and once connection is cheap the walled garden flips from the safe bet to the expensive mistake. The question is no longer whether you can afford to connect; it's whether you can afford not to."

doors:
  - audience: studios
    label: "GaiaWM"
    href: "https://gaiawm.github.io/"
    blurb: "This principle, built as a product."
  - audience: research
    label: "OntoRAG & the papers"
    href: "https://ontorag.github.io/"
    blurb: "The semantic infrastructure underneath."
  - audience: cto
    label: "Work with me"
    href: "mailto:marco.montanari@gmail.com"
    blurb: "This is how I reason about systems."
---

For thirty years, "integration" meant pain. If two systems needed to talk, somebody had to sit down, read two sets of documentation, agree on a schema, write an adapter, and maintain it forever. Every connection was a project. Every project had a cost. And because connections were expensive, the rational move — for any company that wanted to keep you — was to build a wall around its data and make leaving more expensive than staying.

That was the economic logic of the walled garden. Not malice. Math. Connecting was costly, so hoarding paid.

Large language models are about to break that math, and almost nobody is talking about the part that matters.

## Stop calling it the engine

The loudest conversation about LLMs treats them as engines — autonomous things that *do* the work. Write the code, answer the ticket, generate the image. Under that framing, the obvious move is to bolt an LLM onto your product as a feature and call it innovation. A chatbot in the corner. A "summarize" button. A copilot.

This is the least interesting thing an LLM can be, and building your strategy around it is a mistake.

An LLM on its own knows nothing reliable about your world. It is stateless, ungrounded, and confidently wrong on a schedule. As an engine, it is mediocre. But that was never its real job.

The thing an LLM is genuinely, almost embarrassingly good at is *translating between interfaces that were never designed to talk to each other.* Give it a messy output from one system and a vague description of what another system expects, and it bridges them. Not perfectly — but cheaply, and at a scale that used to require a human integration team and a quarter of runway.

That is not an engine. That is a lever. And a lever's whole point is that it lets a small force move something that used to be immovable.

## What changes when connection becomes cheap

Here is the shift, stated plainly: the cost of connecting two systems is collapsing toward zero, while the cost of building and maintaining a walled garden stays exactly where it was.

When connection was expensive, lock-in was the smart play. When connection is cheap, lock-in becomes the *expensive* play — you are now paying to wall off a world that everyone else is wiring together for free. You are spending money to be less useful.

This is why the interesting consequence of LLMs is not technical. It is structural. They make a different *shape* of system economically rational: not monoliths that own everything, but networks of small, independent services that each do one thing well and connect on demand. The kind of architecture that open-source and federated systems have always *wanted* to be, but couldn't afford to be, because the glue was too expensive.

The glue just got cheap.

## A concrete network: three services, zero replication

Let me make this real with something I work on, not as a product pitch but because it is the cleanest example I know of the principle.

Start with **OpenHistoryMap**. Its job is grounding: it holds historical and geographic data — what the world *actually was*, where, and when. It does not make games. It does not run anything. It is a source of truth about the past.

On top of that grounding sits **games.ofthepast.org**, which builds playable historical games. It does not own the historical data — it *uses* OHM as infrastructure, the way you use the electrical grid without owning a power plant. It reaches into that grounding to make the past coherent and playable.

And those games become actually launchable through **JustPlay's launcher**, which does the one thing the other two don't: it lets people sit down and *play*. It doesn't reimplement the maps. It doesn't reimplement the historical layer. It launches.

Three services. Three independent owners. Three independent roadmaps. And — this is the part that matters — **nobody replicates anybody else's data.** OHM's history lives in exactly one place. The games layer doesn't copy it; it references it. The launcher doesn't absorb the games; it points at them.

Each node grows on its own clock. OHM gets richer as historians add data, and every game downstream gets better for free. The games layer adds titles without asking permission from the map. The launcher improves its UX without touching either. Nobody is blocked on anybody. There is no central platform that owns the stack and throttles the others — and crucially, no one *wants* to build one, because building one would mean re-implementing two things that already work and that you'd have to maintain forever.

That last sentence is the whole argument. The walled garden isn't refused on principle here. It's refused because, once connection is cheap, the garden is simply the worse engineering decision.

## The thinking changes before the tooling does

I said at the start that this is about systemic thinking, and here is where the lever changes the mind, not just the architecture.

When integration was expensive, you were trained — by budgets, by deadlines, by scar tissue — to think in silos. Scope it down. Own your stack. Don't depend on anyone, because every dependency is a negotiation and a liability. Point-to-point integration was the default mental model because anything more ambitious got killed in planning.

That instinct is now a handicap.

The architect who still reaches for "let's build it all in-house so we control it" is optimizing for a constraint that no longer binds. The cost they're avoiding has evaporated, and the wall they're building is now pure liability — code to maintain, data to keep in sync, a roadmap held hostage to their own monolith.

The new instinct — the one the lever rewards — is to ask: *what is the one thing this service should be the source of truth for, and what can it simply reference from somewhere else?* You stop thinking about what to own and start thinking about what to connect. You design for the perimeter, not the center. You assume the rest of the world is reachable, because it increasingly is.

This is genuinely a different way of seeing. Silo-thinking sees a system as a fortress to be completed. Network-thinking sees a system as a node to be situated. The first asks "what do I need to contain?" The second asks "what already exists that I can stand on?"

## The Federation was right

There's an older idea hiding under all of this. The most durable systems are not the ones that own the most — they're the ones that are *most worth connecting to.* Value accrues to the node everyone wants to reference, not the wall everyone is trapped behind.

We used to have to choose between that vision and the budget. Openness was the ideologically nice option and lock-in was the financially safe one, and the financially safe one usually won.

LLMs are quietly removing the trade-off. They are making the open, federated, non-replicating, independently-growing network of services not just the principled choice but the cheap one — and cheap, in the end, is what actually wins.

The lever is here. The question is no longer whether you can afford to connect. It's whether you can afford not to.
