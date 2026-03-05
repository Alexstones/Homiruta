#!/usr/bin/env bash
# Apply the schema to the Supabase project using the CLI
# Requires supabase CLI installed and logged in
supabase db reset --file supabase/schema.sql
