# 2026 부산교구 젊은이의 날 (BYD) — Makefile
# 표준 배포, 검증 및 환경변수 프로비저닝 인터페이스

SHELL := /bin/bash
.DEFAULT_GOAL := help

# ANSI 색상 코드
CYAN  := \033[36m
GREEN := \033[32m
YELLOW:= \033[33m
RED   := \033[31m
RESET := \033[0m

.PHONY: help
help: ## 사용 가능한 Makefile 명령어 목록 출력
	@echo -e "$(CYAN)=== 2026 BYD 프로젝트 운영 및 프로비저닝 타겟 ===$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ------------------------------------------------------------------------------
# 환경변수 및 시크릿 프로비저닝 (Ansible & Vercel 연동)
# ------------------------------------------------------------------------------

.PHONY: env-sync-vercel
env-sync-vercel: ## Ansible 플레이북을 통해 pass/.env.local 환경변수를 Vercel 프로덕션/프리뷰에 멱등성 동기화
	@echo -e "$(CYAN)→ Vercel 환경변수 멱등성 동기화 실행 (Ansible)...$(RESET)"
	@ansible-playbook -i infra/ansible/inventory/hosts.ini infra/ansible/playbooks/sync-vercel-env.yml

.PHONY: env-check
env-check: ## Vercel 프로덕션에 등록된 환경변수 목록 및 필수 8대 키 존재 여부 점검
	@echo -e "$(CYAN)→ Vercel 환경변수 등록 상태 점검 (Scope: jsconn)...$(RESET)"
	@export VERCEL_TOKEN="$$(pass show vercel.com/token-jsconn 2>/dev/null | head -n 1 | tr -d '\r\n')"; \
	if [ -z "$$VERCEL_TOKEN" ]; then \
		echo -e "$(RED)⛔ Vercel 토큰 조회 실패 (pass show vercel.com/token-jsconn)$(RESET)"; exit 1; \
	fi; \
	npx vercel env ls --scope jsconn --token "$$VERCEL_TOKEN"

.PHONY: env-pull
env-pull: ## Vercel 개발 환경변수를 로컬 .env.local 로 풀 (백업 선행)
	@echo -e "$(CYAN)→ Vercel 환경변수 로컬 동기화 (.env.local.bak 생성)...$(RESET)"
	@[ -f .env.local ] && cp .env.local .env.local.bak || true
	@export VERCEL_TOKEN="$$(pass show vercel.com/token-jsconn 2>/dev/null | head -n 1 | tr -d '\r\n')"; \
	npx vercel env pull .env.local --yes --scope jsconn --token "$$VERCEL_TOKEN"

# ------------------------------------------------------------------------------
# 빌드 및 테스트 검증
# ------------------------------------------------------------------------------

.PHONY: test
test: ## Node.js 내장 단위/통합 테스트 실행
	@npm test

.PHONY: test-e2e
test-e2e: ## Playwright E2E 브라우저 테스트 실행 (Desktop & Mobile)
	@npx playwright test

.PHONY: build
build: ## Next.js 프로덕션 최적화 빌드 실행
	@npm run build
