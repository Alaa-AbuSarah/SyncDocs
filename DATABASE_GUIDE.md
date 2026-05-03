# 🤖 Claude Usage Guide -- Shared Supabase BaaS (STRICT MODE)

This document defines **ABSOLUTE rules** for how Claude interacts with
the shared Supabase database.

------------------------------------------------------------------------

# 🧠 Core Principle

This database is a **shared Backend-as-a-Service (BaaS)** across
multiple projects.

Claude MUST:

-   Treat the database as **production-critical infrastructure**
-   Avoid **any unintended access or modification**
-   Operate with **strict isolation**

------------------------------------------------------------------------

# 🚫 Hard Restrictions (ABSOLUTE)

## 1. Table Access Policy

Claude is **FORBIDDEN from using ANY existing table**\
EXCEPT:

✅ `profiles`

------------------------------------------------------------------------

## ❌ Forbidden Scope

Claude MUST NOT interact with:

-   ❌ `portfolio_projects`
-   ❌ `portfolio_settings`
-   ❌ Any other existing table (present or future)

This includes:

-   Reading
-   Writing
-   Updating
-   Deleting
-   Joining
-   Inferring structure
-   Referencing in code

👉 **Only `profiles` exists in Claude's world. Everything else is
invisible.**

------------------------------------------------------------------------

# 👤 Allowed Table: `profiles` (ONLY)

## Schema

-   `id` (uuid, PK, references auth.users.id)
-   `email` (text)
-   `role` (text)
-   `avatar_url` (text, optional)
-   `created_at` (timestamp)

------------------------------------------------------------------------

## Allowed Actions

Claude MAY:

-   Read current user profile
-   Update **own profile only**
    -   e.g. `avatar_url`

------------------------------------------------------------------------

## Forbidden Actions

Claude MUST NOT:

-   Change `role` under ANY condition
-   Assign:
    -   ❌ `admin`
    -   ❌ `editor`
-   Access other users' profiles (respect RLS)
-   Build features depending on roles other than:

``` ts
role === 'member'
```

👉 **Claude must assume ALL users are `member`**

------------------------------------------------------------------------

# 🔐 RLS (Row Level Security)

-   Fully enforced at database level

Claude MUST NOT:

-   Modify policies
-   Disable RLS
-   Attempt to bypass it

------------------------------------------------------------------------

# 🏗️ New Table Creation (STRICT ISOLATION)

Claude MUST NOT use existing shared tables.

If new data storage is required:

## Naming Rule (MANDATORY)

    <ProjectName>_<FeatureName>

### ✅ Examples:

-   `SmartManual_pages`
-   `Portfolio_comments`
-   `QRDocs_events`

### ❌ Forbidden:

-   `projects`
-   `settings`
-   `data`
-   `items`

------------------------------------------------------------------------

## Required Columns

Every new table MUST include:

``` sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

------------------------------------------------------------------------

## Triggers

Claude SHOULD always attach:

``` sql
EXECUTE FUNCTION public.set_updated_at();
```

------------------------------------------------------------------------

# 🧾 SQL Rules

Claude MUST:

-   Only generate SQL (never execute)
-   Keep SQL minimal and safe
-   Add comments explaining intent

Claude MUST NOT:

-   Drop tables
-   Alter existing tables
-   Modify constraints
-   Touch shared system tables

------------------------------------------------------------------------

# 🧼 Architecture Rules

Claude MUST:

-   Keep features **fully isolated per project**
-   Avoid shared mutable state
-   Use clear, descriptive naming

Claude MUST NOT:

-   Depend on any existing table (except `profiles`)
-   Create generic schemas (`data`, `info`, `value`)

------------------------------------------------------------------------

# ⚠️ Critical Safety Rules

Claude MUST NEVER:

-   Access unknown tables
-   Assume schema outside this document
-   Modify Supabase auth system
-   Escalate privileges
-   Introduce cross-project coupling

------------------------------------------------------------------------

# 🎯 Final Rule (Most Important)

> If a task requires accessing any table other than `profiles`,\
> Claude MUST refuse and propose creating a **new isolated table
> instead**.

------------------------------------------------------------------------

# ✅ Summary

  Area                       Allowed
  -------------------------- -----------------------------
  profiles                   ✅ Yes
  any other existing table   ❌ No
  new tables                 ✅ Yes (with strict naming)
  role changes               ❌ Never
  RLS changes                ❌ Never

------------------------------------------------------------------------
