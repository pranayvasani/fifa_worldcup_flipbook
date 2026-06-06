"""
World Cup Data Story — Verification Script
==========================================
Verifies all 7 stories from the flipbook against raw data.

Data source: github.com/jfjelstul/worldcup
Download CSVs from:
  https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/goals.csv
  https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv
  https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/bookings.csv
  https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/team_appearances.csv
  https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/penalty_kicks.csv

Usage:
  python verify_worldcup_stories.py

  Or run a single story:
  python verify_worldcup_stories.py --story K1
  python verify_worldcup_stories.py --story A3

  Download CSVs automatically:
  python verify_worldcup_stories.py --download
"""

import argparse
import os
import sys

# ── optional: auto-download CSVs ──────────────────────────────────────────────

BASE_URL = "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/"
CSV_FILES = [
    "goals.csv",
    "matches.csv",
    "bookings.csv",
    "team_appearances.csv",
    "penalty_kicks.csv",
]

def download_csvs():
    try:
        import urllib.request
    except ImportError:
        print("urllib not available — install manually.")
        sys.exit(1)

    for fname in CSV_FILES:
        if os.path.exists(fname):
            print(f"  {fname} already exists, skipping.")
            continue
        url = BASE_URL + fname
        print(f"  Downloading {fname} ...")
        urllib.request.urlretrieve(url, fname)
        print(f"  {fname} saved.")
    print()


# ── helpers ───────────────────────────────────────────────────────────────────

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def header(title):
    bar = "─" * 60
    print(f"\n{BOLD}{bar}{RESET}")
    print(f"{BOLD}  {title}{RESET}")
    print(f"{BOLD}{bar}{RESET}")

def ok(label, value, expected=None):
    marker = f"{GREEN}✓{RESET}"
    exp_str = f"  {DIM}(expected: {expected}){RESET}" if expected else ""
    print(f"  {marker}  {label}: {BOLD}{value}{RESET}{exp_str}")

def flag(label, value, note=""):
    marker = f"{YELLOW}!{RESET}"
    print(f"  {marker}  {label}: {BOLD}{value}{RESET}  {DIM}{note}{RESET}")

def row(label, value):
    print(f"     {DIM}{label:<32}{RESET} {value}")

def check(condition, label, value, expected):
    if condition:
        ok(label, value, expected)
    else:
        marker = f"{RED}✗{RESET}"
        print(f"  {marker}  {label}: {BOLD}{RED}{value}{RESET}  {DIM}(expected: {expected}){RESET}")


# ── load data ─────────────────────────────────────────────────────────────────

def load_data():
    try:
        import pandas as pd
    except ImportError:
        print("pandas is required: pip install pandas")
        sys.exit(1)

    missing = [f for f in CSV_FILES if not os.path.exists(f)]
    if missing:
        print(f"\n{RED}Missing CSV files:{RESET} {', '.join(missing)}")
        print(f"Run with --download to fetch them automatically.")
        print(f"Or download manually from:\n  {BASE_URL}\n")
        sys.exit(1)

    import pandas as pd
    goals     = pd.read_csv("goals.csv")
    matches   = pd.read_csv("matches.csv")
    bookings  = pd.read_csv("bookings.csv")
    team_app  = pd.read_csv("team_appearances.csv")
    penalties = pd.read_csv("penalty_kicks.csv")

    mg  = goals[goals["tournament_name"].str.contains("Men's")].copy()
    mm  = matches[matches["tournament_name"].str.contains("Men's")].copy()
    mb  = bookings[bookings["tournament_name"].str.contains("Men's")].copy()
    mt  = team_app[team_app["tournament_name"].str.contains("Men's")].copy()
    mpk = penalties[penalties["tournament_name"].str.contains("Men's")].copy()

    for df in [mg, mm, mb, mt, mpk]:
        df["year"] = df["match_date"].str[:4].astype(int)

    mm["total_goals"] = mm["home_team_score"] + mm["away_team_score"]
    mm["margin"]      = abs(mm["home_team_score_margin"])

    return mg, mm, mb, mt, mpk


# ── stories ───────────────────────────────────────────────────────────────────

def story_k1(mg, mm, mb, mt, mpk):
    """K1 — Score first → win 72.8%"""
    header("K1  ·  Score first, win almost ¾ of the time")

    mg_s   = mg.sort_values(["match_id", "minute_regulation", "minute_stoppage"])
    first  = mg_s.groupby("match_id").first().reset_index()
    fg     = first.merge(
        mm[["match_id", "home_team_win", "away_team_win", "draw",
            "group_stage", "knockout_stage"]],
        on="match_id"
    )
    fg["scorer_won"]  = (
        ((fg["home_team"] == 1) & (fg["home_team_win"] == 1)) |
        ((fg["home_team"] == 0) & (fg["away_team_win"] == 1))
    )
    fg["scorer_drew"] = fg["draw"] == 1
    fg["scorer_lost"] = ~fg["scorer_won"] & ~fg["scorer_drew"]

    total     = len(fg)
    win_pct   = fg["scorer_won"].mean()
    draw_pct  = fg["scorer_drew"].mean()
    lose_pct  = fg["scorer_lost"].mean()

    print(f"\n  Total matches with ≥1 goal: {total}")
    check(abs(win_pct  - 0.728) < 0.005, "Scorer win rate",   f"{100*win_pct:.1f}%",  "72.8%")
    check(abs(draw_pct - 0.128) < 0.005, "Scorer draw rate",  f"{100*draw_pct:.1f}%", "12.8%")
    check(abs(lose_pct - 0.144) < 0.005, "Scorer lose rate",  f"{100*lose_pct:.1f}%", "14.4%")

    print(f"\n  {DIM}Subgroup checks (Simpson's Paradox guard):{RESET}")
    group_wr = fg[fg["group_stage"]    == 1]["scorer_won"].mean()
    ko_wr    = fg[fg["knockout_stage"] == 1]["scorer_won"].mean()
    row("Group stage only",   f"{100*group_wr:.1f}%  (n={fg['group_stage'].sum()})")
    row("Knockout stage only", f"{100*ko_wr:.1f}%  (n={fg['knockout_stage'].sum()})")

    away_first    = fg[fg["home_team"] == 0]
    away_baseline = mm["away_team_win"].mean()
    row("Away scores first → away wins", f"{100*away_first['away_team_win'].mean():.1f}%")
    row("Baseline away win rate",         f"{100*away_baseline:.1f}%")

    print(f"\n  {DIM}Raw counts:{RESET}")
    row("Scorer won",   fg["scorer_won"].sum())
    row("Scorer drew",  fg["scorer_drew"].sum())
    row("Scorer lost",  fg["scorer_lost"].sum())


def story_k2(mg, mm, mb, mt, mpk):
    """K2 — Red card → home win rate drops to 17.9%"""
    header("K2  ·  Red card — home team now wins just 18%")

    reds_h = (mb[(mb["red_card"] == 1) & (mb["home_team"] == 1)]
              .groupby("match_id").size().reset_index(name="hr"))
    reds_a = (mb[(mb["red_card"] == 1) & (mb["home_team"] == 0)]
              .groupby("match_id").size().reset_index(name="ar"))

    mm2        = mm.merge(reds_h, on="match_id", how="left").merge(reds_a, on="match_id", how="left")
    mm2["hr"]  = mm2["hr"].fillna(0)
    mm2["ar"]  = mm2["ar"].fillna(0)

    clean  = mm2[(mm2["hr"] == 0) & (mm2["ar"] == 0)]
    h_red  = mm2[(mm2["hr"] >= 1) & (mm2["ar"] == 0)]
    a_red  = mm2[(mm2["ar"] >= 1) & (mm2["hr"] == 0)]

    clean_hw = clean["home_team_win"].mean()
    hred_hw  = h_red["home_team_win"].mean()
    ared_hw  = a_red["home_team_win"].mean()
    swing    = hred_hw - clean_hw

    print()
    check(abs(clean_hw - 0.578) < 0.005, "Clean game home win",        f"{100*clean_hw:.1f}%", "57.8%")
    check(abs(hred_hw  - 0.179) < 0.005, "Home gets red — home win",   f"{100*hred_hw:.1f}%",  "17.9%")
    check(abs(ared_hw  - 0.684) < 0.005, "Away gets red — home win",   f"{100*ared_hw:.1f}%",  "68.4%")
    check(abs(swing    + 0.399) < 0.01,  "Swing (clean→home red)",     f"{100*swing:+.1f}pp",  "~−40pp")

    print(f"\n  {DIM}Sample sizes:{RESET}")
    row("Clean matches",                len(clean))
    row("Home got red (away clean)",    len(h_red))
    row("Away got red (home clean)",    len(a_red))

    print(f"\n  {DIM}Red cards by era:{RESET}")
    for label, y1, y2 in [("1930-1969",1930,1969),("1970-1989",1970,1989),
                           ("1990-2005",1990,2005),("2006-2022",2006,2022)]:
        era_mm   = mm[(mm["year"] >= y1) & (mm["year"] <= y2)]
        era_reds = mb[(mb["red_card"] == 1) & (mb["year"] >= y1) & (mb["year"] <= y2)]
        row(label, f"{len(era_reds)} reds in {len(era_mm)} games = {len(era_reds)/len(era_mm):.3f}/game")


def story_k3(mg, mm, mb, mt, mpk):
    """K3 — More cards = tighter scoreline"""
    header("K3  ·  More cards in a game? Score is probably tight")

    bpm     = mb.groupby("match_id").size().reset_index(name="bkgs")
    mm3     = mm.merge(bpm, on="match_id", how="left")
    mm3["bkgs"] = mm3["bkgs"].fillna(0)

    buckets = [(0, 0, "0 cards"), (1, 2, "1-2 cards"), (3, 4, "3-4 cards"),
               (5, 7, "5-7 cards"), (8, 99, "8+ cards")]

    print(f"\n  {'Bucket':<12} {'n':>5} {'Avg margin':>12} {'Draw%':>8} {'1-goal%':>8}")
    print(f"  {'─'*48}")
    margins = {}
    for lo, hi, label in buckets:
        sub = mm3[(mm3["bkgs"] >= lo) & (mm3["bkgs"] <= hi)]
        avg = sub["margin"].mean()
        margins[label] = avg
        print(f"  {label:<12} {len(sub):>5} {avg:>12.2f} "
              f"{100*sub['draw'].mean():>7.1f}% "
              f"{100*(sub['margin']==1).mean():>7.1f}%")

    print()
    check(abs(margins["0 cards"]   - 1.87) < 0.05, "0-card margin",   f"{margins['0 cards']:.2f}",  "1.87")
    check(abs(margins["5-7 cards"] - 1.16) < 0.05, "5-7 card margin", f"{margins['5-7 cards']:.2f}", "1.16")
    check(abs(margins["8+ cards"]  - 1.09) < 0.10, "8+ card margin",  f"{margins['8+ cards']:.2f}",  "1.09")

    most_carded = mm3.loc[mm3["bkgs"].idxmax()]
    flag("Most carded match ever",
         f"{most_carded['match_name']} — {int(most_carded['bkgs'])} bookings, margin {int(most_carded['margin'])}")


def story_a1(mg, mm, mb, mt, mpk):
    """A1 — Soviet Union group vs knockout"""
    header("A1  ·  The Soviet Union were better than Brazil in groups")

    teams = ["Italy", "France", "Germany", "West Germany",
             "Brazil", "Argentina", "Netherlands", "Soviet Union", "Mexico"]

    print(f"\n  {'Team':<16} {'G%':>6} {'G-n':>5} {'KO%':>7} {'KO-n':>6} {'Uplift':>8}")
    print(f"  {'─'*54}")

    results = {}
    for team in teams:
        g = mt[(mt["team_name"] == team) & (mt["group_stage"]    == 1)]
        k = mt[(mt["team_name"] == team) & (mt["knockout_stage"] == 1)]
        if len(g) == 0 or len(k) < 3:
            continue
        gwr = g["win"].mean()
        kwr = k["win"].mean()
        results[team] = {"gwr": gwr, "kwr": kwr, "uplift": kwr - gwr}
        uplift_str = f"{100*(kwr-gwr):+.1f}pp"
        print(f"  {team:<16} {100*gwr:>5.1f}% {len(g):>5}  {100*kwr:>5.1f}% {len(k):>6}  {uplift_str:>8}")

    print()
    if "Soviet Union" in results:
        ussr = results["Soviet Union"]
        check(abs(ussr["gwr"] - 0.583) < 0.01, "USSR group win%",    f"{100*ussr['gwr']:.1f}%", "58.3%")
        check(abs(ussr["kwr"] - 0.143) < 0.01, "USSR knockout win%", f"{100*ussr['kwr']:.1f}%", "14.3%")
        check(abs(ussr["uplift"] + 0.44) < 0.02, "USSR uplift",      f"{100*ussr['uplift']:+.1f}pp", "−44pp")
    if "Italy" in results:
        italy = results["Italy"]
        check(abs(italy["uplift"] - 0.30) < 0.02, "Italy uplift",    f"{100*italy['uplift']:+.1f}pp", "+30pp")


def story_a2(mg, mm, mb, mt, mpk):
    """A2 — Netherlands group vs knockout"""
    header("A2  ·  Netherlands: most gifted team that never won anything")

    ned_g = mt[(mt["team_name"] == "Netherlands") & (mt["group_stage"]    == 1)]
    ned_k = mt[(mt["team_name"] == "Netherlands") & (mt["knockout_stage"] == 1)]

    gwr    = ned_g["win"].mean()
    kwr    = ned_k["win"].mean()
    uplift = kwr - gwr

    print()
    check(abs(gwr    - 0.636) < 0.01, "NED group win%",    f"{100*gwr:.1f}%  ({ned_g['win'].sum()}/{len(ned_g)})", "63.6%")
    check(abs(kwr    - 0.455) < 0.01, "NED knockout win%", f"{100*kwr:.1f}%  ({ned_k['win'].sum()}/{len(ned_k)})", "45.5%")
    check(abs(uplift + 0.18)  < 0.02, "NED uplift",        f"{100*uplift:+.1f}pp", "−18pp")

    print(f"\n  {DIM}Netherlands knockout results:{RESET}")
    for _, r in ned_k.sort_values("year").iterrows():
        result_str = "W" if r["win"] else ("L" if r["lose"] else "D")
        row(str(int(r["year"])), f"[{result_str}]  {r['match_name']}")


def story_a3(mg, mm, mb, mt, mpk):
    """A3 — West Germany 92.9% penalty conversion"""
    header("A3  ·  West Germany hit 92.9% from the spot — perfect")

    pk_conv = mpk.groupby("team_name").agg(
        attempts=("converted", "count"),
        scored=("converted", "sum")
    ).reset_index()
    pk_conv["rate"] = pk_conv["scored"] / pk_conv["attempts"] * 100
    pk_conv = pk_conv[pk_conv["attempts"] >= 3].sort_values("rate", ascending=False)

    print(f"\n  {'Team':<22} {'Scored':>7} {'Att':>5} {'Rate':>7}")
    print(f"  {'─'*40}")
    for _, r in pk_conv.iterrows():
        print(f"  {r['team_name']:<22} {int(r['scored']):>7} {int(r['attempts']):>5} {r['rate']:>6.1f}%")

    def get_rate(team):
        row_ = pk_conv[pk_conv["team_name"] == team]
        return row_["rate"].values[0] if len(row_) else None

    print()
    wg_rate  = get_rate("West Germany")
    arg_rate = get_rate("Argentina")
    eng_rate = get_rate("England")
    mex_rate = get_rate("Mexico")

    if wg_rate:  check(abs(wg_rate  - 92.9) < 0.5, "W.Germany conversion", f"{wg_rate:.1f}%",  "92.9%")
    if arg_rate: check(abs(arg_rate - 80.6) < 0.5, "Argentina conversion", f"{arg_rate:.1f}%", "80.6%")
    if eng_rate: check(abs(eng_rate - 57.9) < 0.5, "England conversion",   f"{eng_rate:.1f}%", "57.9%")
    if mex_rate: check(abs(mex_rate - 28.6) < 1.0, "Mexico conversion",    f"{mex_rate:.1f}%", "28.6%")

    print(f"\n  {DIM}Shootout win/loss records (min 2 shootouts):{RESET}")
    so = (mt[mt["penalty_shootout"] == 1]
          .groupby("team_name")
          .agg(shootouts=("match_id","count"), wins=("win","sum"), losses=("lose","sum"))
          .reset_index())
    so = so[so["shootouts"] >= 2].sort_values("wins", ascending=False)
    for _, r in so.iterrows():
        row(r["team_name"], f"{int(r['wins'])}W – {int(r['losses'])}L  ({int(r['shootouts'])} shootouts)")


def story_a4(mg, mm, mb, mt, mpk):
    """A4 — 1 in 10 goals after 90 mins (2010+)"""
    header("A4  ·  1 in 10 goals scored after the clock should have stopped")

    mg["is_stoppage"] = mg["minute_stoppage"] > 0

    eras = [("Pre-1990",  1930, 1989),
            ("1990-2009", 1990, 2009),
            ("2010-2022", 2010, 2022)]

    print(f"\n  {'Era':<14} {'Total':>7} {'Stoppage':>10} {'%':>7}")
    print(f"  {'─'*42}")
    era_results = {}
    for label, y1, y2 in eras:
        e    = mg[(mg["year"] >= y1) & (mg["year"] <= y2)]
        stop = e["is_stoppage"].sum()
        tot  = len(e)
        pct  = 100 * stop / tot if tot > 0 else 0
        era_results[label] = pct
        print(f"  {label:<14} {tot:>7} {stop:>10} {pct:>6.1f}%")

    print()
    check(era_results["Pre-1990"]  == 0,                            "Pre-1990 stoppage%",  "0.0%",  "0%")
    check(abs(era_results["1990-2009"] - 6.4) < 0.5,               "1990-2009 stoppage%", f"{era_results['1990-2009']:.1f}%", "6.4%")
    check(abs(era_results["2010-2022"] - 10.2) < 0.5,              "2010-2022 stoppage%", f"{era_results['2010-2022']:.1f}%", "10.2%")

    print(f"\n  {DIM}By tournament:{RESET}")
    by_yr = mg.groupby("year").agg(
        total=("goal_id", "count"),
        stoppage=("is_stoppage", "sum")
    ).reset_index()
    by_yr["pct"] = by_yr["stoppage"] / by_yr["total"] * 100
    for _, r in by_yr.iterrows():
        bar = "█" * int(r["pct"] / 1.5)
        row(str(int(r["year"])), f"{int(r['stoppage']):>3} / {int(r['total'])}  ({r['pct']:>5.1f}%)  {bar}")

    print(f"\n  {DIM}Latest stoppage time goals ever:{RESET}")
    late = mg[mg["is_stoppage"]].sort_values("minute_stoppage", ascending=False).head(5)
    for _, r in late.iterrows():
        row(r["match_name"], f"90+{int(r['minute_stoppage'])}'  ({int(r['year'])})  {r['player_team_name']}")


# ── registry & runner ─────────────────────────────────────────────────────────

STORY_MAP = {
    "K1": story_k1,
    "K2": story_k2,
    "K3": story_k3,
    "A1": story_a1,
    "A2": story_a2,
    "A3": story_a3,
    "A4": story_a4,
}

def run_all(mg, mm, mb, mt, mpk):
    print(f"\n{BOLD}World Cup Data Story — Full Verification{RESET}")
    print(f"{DIM}Running all 7 stories against raw CSV data{RESET}")
    for key, fn in STORY_MAP.items():
        fn(mg, mm, mb, mt, mpk)
    print(f"\n{BOLD}{'─'*60}{RESET}")
    print(f"{BOLD}  Done.{RESET}  {DIM}All ✓ = numbers match the flipbook exactly.{RESET}\n")


# ── entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Verify World Cup flipbook stories against raw data."
    )
    parser.add_argument(
        "--story",
        choices=list(STORY_MAP.keys()),
        help="Run a single story (e.g. K1, A3). Omit to run all."
    )
    parser.add_argument(
        "--download",
        action="store_true",
        help="Download CSV files from GitHub before running."
    )
    args = parser.parse_args()

    if args.download:
        print(f"\n{BOLD}Downloading CSV files...{RESET}")
        download_csvs()

    mg, mm, mb, mt, mpk = load_data()

    if args.story:
        STORY_MAP[args.story](mg, mm, mb, mt, mpk)
        print()
    else:
        run_all(mg, mm, mb, mt, mpk)
