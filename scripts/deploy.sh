#!/bin/bash

# Universal deployment orchestrator for Next.js Universal Template
# Supports: Vercel, Deno Deploy, Cloudflare Pages, or all in sequence

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

PNPM_BIN=${PNPM_BIN:-pnpm}
VERCEL_BIN=${VERCEL_BIN:-vercel}
DEPLOYCTL_BIN=${DEPLOYCTL_BIN:-deployctl}
WRANGLER_BIN=${WRANGLER_BIN:-wrangler}

log_info() {
  echo -e "\033[1;34m==>\033[0m $1"
}

log_warn() {
  echo -e "\033[1;33m⚠️  $1\033[0m"
}

log_error() {
  echo -e "\033[1;31m❌ $1\033[0m"
}

require_cli() {
  local cli_name=$1
  local install_help=$2
  if ! command -v "$cli_name" >/dev/null 2>&1; then
    log_error "$cli_name CLI not found."
    log_warn "Install instructions: $install_help"
    return 1
  fi
  return 0
}

run_pnpm() {
  if command -v "$PNPM_BIN" >/dev/null 2>&1; then
    "$PNPM_BIN" "$@"
  else
    log_error "pnpm is required for this repository."
    log_warn "Install pnpm: corepack enable && corepack prepare pnpm@latest --activate"
    exit 1
  fi
}

deploy_vercel() {
  log_info "Deploying to Vercel..."
  if ! require_cli "$VERCEL_BIN" "npm i -g vercel"; then
    return 1
  fi

  local vercel_args=("deploy" "--prod")
  local using_non_interactive=false

  if [[ -n "${VERCEL_TOKEN:-}" ]]; then
    vercel_args+=("--token" "$VERCEL_TOKEN" "--yes")
    using_non_interactive=true
  fi

  if [[ -n "${VERCEL_ORG_ID:-}" ]]; then
    export VERCEL_ORG_ID
    using_non_interactive=true
  fi

  if [[ -n "${VERCEL_PROJECT_ID:-}" ]]; then
    export VERCEL_PROJECT_ID
    using_non_interactive=true
  fi

  if [[ -n "${VERCEL_TEAM:-}" ]]; then
    log_warn "VERCEL_TEAM is deprecated by the Vercel CLI. Please configure VERCEL_ORG_ID instead."
  fi

  if [[ "$using_non_interactive" == true ]]; then
    log_info "Running non-interactive Vercel deployment using configured environment variables."
  else
    log_warn "Running interactive deployment. Set VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID for CI/CD pipelines."
  fi

  "$VERCEL_BIN" "${vercel_args[@]}"
}

deploy_deno() {
  log_info "Deploying to Deno Deploy..."
  if ! require_cli "$DEPLOYCTL_BIN" "deno install -A jsr:@deno/deploy-cli"; then
    return 1
  fi

  if command -v deno >/dev/null 2>&1; then
    log_info "Priming Deno cache (deno task cache)..."
    deno task cache >/dev/null 2>&1 || log_warn "Unable to prime Deno cache; continuing."
  fi

  local deploy_args=("deploy")

  if [[ -n "${DENO_PROJECT:-}" ]]; then
    deploy_args+=("--project" "$DENO_PROJECT")
  fi
  if [[ -n "${DENO_DEPLOY_TOKEN:-}" ]]; then
    deploy_args+=("--token" "$DENO_DEPLOY_TOKEN")
  fi

  if [[ -z "${DENO_DEPLOY_TOKEN:-}" ]]; then
    log_warn "Missing DENO_DEPLOY_TOKEN. The CLI may prompt for login."
  fi
  if [[ -z "${DENO_PROJECT:-}" ]]; then
    log_warn "Missing DENO_PROJECT. You can pass --project=<name> manually if prompted."
  fi

  deploy_args+=("deno_server.ts")

  "$DEPLOYCTL_BIN" "${deploy_args[@]}"
}

deploy_cloudflare() {
  log_info "Deploying to Cloudflare Pages..."
  if ! require_cli "$WRANGLER_BIN" "npm i -g wrangler"; then
    return 1
  fi

  ensure_cloudflare_build_artifacts

  local project_name=${CLOUDFLARE_PROJECT_NAME:-nextjs-universal-template}
  local deploy_cmd=("$WRANGLER_BIN" "pages" "deploy" ".vercel/output/static" "--project-name=${project_name}")

  if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    export CLOUDFLARE_ACCOUNT_ID
  fi
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    export CLOUDFLARE_API_TOKEN
  fi

  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    log_warn "Missing CLOUDFLARE_API_TOKEN. Wrangler may open a browser for authentication."
  fi

  "${deploy_cmd[@]}"
}

prepare_all_artifacts() {
  if [[ -d ".next" ]]; then
    log_info "Reusing existing Next.js build (.next)."
  else
    log_info "Preparing shared Next.js build (pnpm build)..."
    run_pnpm build
  fi

  if command -v deno >/dev/null 2>&1; then
    log_info "Preparing Deno cache..."
    deno task cache >/dev/null 2>&1 || log_warn "Deno cache warm-up failed; continuing."
  fi

  ensure_cloudflare_build_artifacts
}

ensure_cloudflare_build_artifacts() {
  if [[ -d ".vercel/output/static" ]]; then
    log_info "Reusing existing Cloudflare build artifacts (.vercel/output/static)."
    return
  fi

  log_info "Building Cloudflare-compatible output (pnpm pages:build)..."
  run_pnpm pages:build
}

print_summary() {
  local vercel_status=$1
  local deno_status=$2
  local cloudflare_status=$3

  echo ""
  log_info "Deployment summary"
  echo "  Vercel:      $([[ $vercel_status -eq 0 ]] && echo "✅" || echo "❌ ($vercel_status)")"
  echo "  Deno Deploy: $([[ $deno_status -eq 0 ]] && echo "✅" || echo "❌ ($deno_status)")"
  echo "  Cloudflare:  $([[ $cloudflare_status -eq 0 ]] && echo "✅" || echo "❌ ($cloudflare_status)")"
}

PLATFORM=${1:-"help"}

case $PLATFORM in
  vercel)
    deploy_vercel
    ;;

  deno)
    deploy_deno
    ;;

  cloudflare)
    deploy_cloudflare
    ;;

  all)
    log_info "Starting sequential deployment to Vercel, Deno Deploy, and Cloudflare Pages..."
    prepare_all_artifacts

    set +e
    deploy_vercel
    vercel_status=$?

    deploy_deno
    deno_status=$?

    deploy_cloudflare
    cloudflare_status=$?
    set -e

    print_summary "$vercel_status" "$deno_status" "$cloudflare_status"

    if [[ $vercel_status -ne 0 || $deno_status -ne 0 || $cloudflare_status -ne 0 ]]; then
      exit 1
    fi
    ;;

  build)
    prepare_all_artifacts
    log_info "Builds completed. You can now run platform-specific deployments."
    ;;

  help|*)
    cat <<'USAGE'
Usage: ./scripts/deploy.sh [platform]

Platforms:
  vercel       Deploy to Vercel (interactive or token-based)
  deno         Deploy to Deno Deploy (requires deployctl)
  cloudflare   Deploy to Cloudflare Pages (requires Wrangler)
  all          Prepare builds and deploy to all supported platforms sequentially
  build        Prepare build artifacts without deploying
  help         Show this help message

Environment variables:
  # Vercel
  VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TEAM

  # Deno Deploy
  DENO_DEPLOY_TOKEN, DENO_PROJECT

  # Cloudflare Pages
  CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_PROJECT_NAME

Examples:
  ./scripts/deploy.sh vercel
  ./scripts/deploy.sh all
USAGE
    ;;
esac

