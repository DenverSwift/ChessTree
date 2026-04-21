# ChessTree MVP Specification

## 1. Overview

ChessTree MVP is a web application for learning chess openings through an interactive tree-based structure.

The user:
- searches for an opening
- explores its structure
- studies variations
- interacts with a chessboard linked to a move tree

The system focuses on visualization and navigation, not analysis or data persistence.

---

## 2. Goal

The goal of the MVP is to provide:

- fast access to chess openings
- clear visualization of opening structures
- interactive learning via board + tree
- intuitive navigation between variations

---

## 3. Target User

The MVP supports a single user type:

**Guest user**

Capabilities:
- search openings
- browse library
- open opening pages
- explore variations
- interact with board and tree

Not included:
- authentication
- saved progress
- personalization

---

## 4. Pages

The MVP includes the following pages:

- Home
- Library
- Opening Page
- Opening Explorer
- Contact Us

---

## 5. Home Page

Purpose:
- entry point
- quick access to search

Content:
- title and short description
- search input
- visual block (image or graphic)
- navigation menu

Layout:
- left side: title, text, search
- right side: visual

---

## 6. Library Page

Purpose:
- display list of openings
- allow filtering and searching

Content:
- search bar
- opening cards
- filter panel

### Opening Card Fields

Each card contains:
- name
- short description
- board thumbnail
- difficulty
- popularity
- side (white / black)
- number of variations
- style (aggressive / positional / tactical / solid)
- ECO code

### Filters

Filters are applied instantly.

Available filters:
- name
- side
- difficulty
- popularity
- ECO code
- opening type
- style
- number of variations

### Interaction

- clicking a card opens the Opening Page

---

## 7. Opening Page

Purpose:
- provide detailed information about a specific opening
- allow navigation to variations or full tree

Content:
- opening name
- image or board preview
- description
- metadata (side, style, difficulty, etc.)
- compact statistical block
- list of variations

### Variation Card Fields

Each variation contains:
- name
- first moves
- short description
- difficulty
- button: "Open in Explorer"

### Navigation

User can:
- open full opening tree
- open a specific variation

---

## 8. Opening Explorer

Purpose:
- main interactive learning interface

### Layout

- left side: chessboard
- right side: move tree

User can:
- show both
- hide board
- hide tree

### UI Elements

- back button
- forward button
- reset position
- flip board
- toggle board visibility
- toggle tree visibility
- move list (text format)
- position evaluation display

---

## 9. Chessboard Behavior

The chessboard is interactive.

User can:
- move pieces via drag and drop
- move pieces via click + click

Rules:
- moves follow chess rules
- illegal moves do nothing

Behavior:
- selecting a node updates the board
- current path is highlighted in the tree

---

## 10. Move Tree Behavior

The move tree is interactive.

User can:
- navigate using right mouse button
- zoom using scroll
- click nodes

Each node contains:
- move evaluation (best / good / inaccuracy / mistake)
- move color (white / black)
- move number
- piece
- move notation (e.g. Nf3)

Behavior:
- clicking node updates board
- full path is highlighted
- tree auto-centers on active node

---

## 11. Temporary Branch

If user makes a move not present in the tree:

- a temporary branch is created
- branch appears in the tree
- no evaluation is assigned

Visual rules:
- active temporary branch looks normal
- inactive branch becomes semi-transparent
- branch lines become dashed

Behavior:
- multiple moves form a temporary chain
- branch is not saved
- branch disappears after leaving the page

---

## 12. Evaluation System

Two evaluation types:

### Move Evaluation (Node Level)
- best
- good
- inaccuracy
- mistake

### Position Evaluation (UI Level)
- evaluation bar near board
- numeric value (e.g. +0.4)

---

## 13. Data

MVP uses static data.

- 5 openings
- depth up to 10 moves
- stored in JSON

### Openings Included

1. Italian Game (White)
2. King's Gambit (White)
3. Sicilian Defense (Black)
4. Caro-Kann Defense (Black)
5. French Defense (Black)

---

## 14. Data Visualization Requirement

To satisfy UI requirements:

- Opening Page includes compact visual indicators:
  - difficulty level
  - popularity level
  - number of variations

No large charts are used.

---

## 15. Out of Scope

The following are excluded from MVP:

- authentication
- user accounts
- progress saving
- user-created openings
- editing trees
- integration with chess platforms
- engine analysis
- comments
- ratings
- recommendations

---

## 16. UX Priorities

The MVP prioritizes:

- clean interface
- intuitive navigation
- strong visual hierarchy
- clear interaction between board and tree
- minimal friction in exploration