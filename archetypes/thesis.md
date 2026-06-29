---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true

# The deck / standfirst, shown under the title.
subtitle: ""

# Canonical URL. Defaults to the ingmmo.com home for this piece so any
# cross-post (Medium, etc.) points back here. Only change if the canonical
# truly lives elsewhere.
canonical: "https://ingmmo.com/thesis/{{ .Name }}/"

# 2–3 sentence pull quote used as the homepage manifesto teaser.
# TODO: write by hand — do NOT auto-generate.
summary_lede: ""

# Routing CTAs. Rendered ONLY in the boundary layer after the essay ends,
# never inside the body. audience ∈ [studios, research, cto].
# A door with an empty `audience` is skipped.
doors:
  - audience: studios
    label: ""
    href: "TODO"
    blurb: ""
  - audience: research
    label: ""
    href: "TODO"
    blurb: ""
  - audience: cto
    label: "Work with me"
    href: "mailto:marco.montanari@gmail.com"
    blurb: ""
---

<!-- PASTE FULL ESSAY BODY HERE — do not generate or paraphrase -->
