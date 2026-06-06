---
layout: post
title: "The World Cup You Think You Know"
date: 2026-06-06
tags: [data, football, world-cup, side-project]
excerpt: "Seven findings from 92 years of World Cup data. Three you already knew. Four you didn't."
---

I spent a weekend with the Fjelstul World Cup database — 964 matches, 2,720 goals, 22 tournaments — and built [an interactive flipbook](https://pranayvasani.github.io/fifa_worldcup_flipbook/) out of it.

The structure is two chapters, on purpose.

**📺 The Known** is three things every pundit already says, confirmed with numbers. Score first, win 73% of the time. A home-team red card crashes win-rate from 58% to 18%. More bookings in a match means a tighter scoreline — cards *are* the tension, not the cause of it.

These were the boring part to verify. They were also the necessary part. Without them, the second chapter has nothing to push against.

**💡 The Aha** is four findings that have been sitting in the data the whole time and almost nobody talks about:

- The **Soviet Union** won 58% of group matches and 14% of knockouts. Statistically the best team in the world at the part of the tournament that doesn't count.
- The **Netherlands** drop 18 percentage points from group to knockout. The most precise number anyone has ever put on 50 years of heartbreak.
- **West Germany** converted 13 of 14 shootout penalties — 92.9%. We've written a library about England's misses (57.9%). Nobody asks why Germany never missed.
- Since 2010, **10.2% of all World Cup goals happen after the 90th minute**. Before 1990, the number was zero. The final whistle is not where you think it is.

The thing I keep coming back to is the West Germany stat. The story we tell about penalty shootouts is built around England's pain. The data has another, equally interesting story — one country that simply never missed — and the conversation has never made room for it. The interesting part of the data isn't the data. It's the gap between what people repeat and what's actually there.

A few notes on the build:

**Don't trust me — verify it.** Every number in the flipbook can be reproduced from the raw CSVs. The repo ships a [`verify_worldcup_stories.py`](https://github.com/pranayvasani/fifa_worldcup_flipbook/blob/main/verify_worldcup_stories.py) script that auto-downloads the source data, runs each story end-to-end, and prints ✓/✗ per claim. If a number is wrong, open an issue and I'll fix the flipbook.

**It's a flipbook, not a dashboard.** Most "data viz" defaults to a dashboard — filters, drilldowns, an invitation to explore. I wanted the opposite: a fixed sequence, newspaper typography, a goal-margin chart that exists for exactly one paragraph and then goes away. The reader's job is to read, not to operate the UI.

**Two chapters earn each other.** "The Known" matters because it makes "The Aha" feel earned. If I'd opened with West Germany's 92.9%, you'd have no reason to care. By the time you get there, you've already agreed with three things the data confirmed, so the fourth — the one that breaks the pattern — actually lands.

**Read time is ~1 minute.** That was the only hard constraint. If you can't get someone through a data essay in the time it takes to ride an elevator, you don't have a data essay, you have a project.

Flip through it: [pranayvasani.github.io/fifa_worldcup_flipbook](https://pranayvasani.github.io/fifa_worldcup_flipbook/)

Code, data, and the verify script: [github.com/pranayvasani/fifa_worldcup_flipbook](https://github.com/pranayvasani/fifa_worldcup_flipbook)

Data: [Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup).
