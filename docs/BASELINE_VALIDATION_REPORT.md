# PrimeContractorOS V2 Baseline Validation

Branch: `agent/complete-v2-mirror`  
Commit tested: `95d5b5f11d2edafc45e5b2f3d08643fa44afb3bd`  
Node: `v22.23.1`  
pnpm: `10.4.1`

## Results

| Check | Exit code |
|---|---:|
| pnpm install --frozen-lockfile | 0 |
| pnpm check | 0 |
| pnpm test | 1 |
| pnpm build | 0 |

Exit code 0 means pass. Exit code 99 means skipped because dependency installation failed.

## Install output (tail)

```text
+ @radix-ui/react-toggle-group 1.1.11
+ @radix-ui/react-tooltip 1.2.8
+ @tanstack/react-query 5.100.9
+ @trpc/client 11.17.0
+ @trpc/react-query 11.17.0
+ @trpc/server 11.17.0
+ @types/archiver 7.0.0
+ @types/pdfkit 0.17.6
+ archiver 8.0.0
+ axios 1.12.2
+ bcryptjs 3.0.3
+ better-sqlite3 12.9.0
+ class-variance-authority 0.7.1
+ clsx 2.1.1
+ cmdk 1.1.1
+ cookie 1.1.1
+ date-fns 4.1.0
+ dotenv 17.4.2
+ drizzle-orm 0.44.7
+ embla-carousel-react 8.6.0
+ express 4.21.2
+ framer-motion 12.23.22
+ input-otp 1.4.2
+ jose 6.1.0
+ jsonwebtoken 9.0.3
+ lucide-react 0.453.0
+ mysql2 3.22.3
+ nanoid 5.1.6
+ next-themes 0.4.6
+ pdfkit 0.18.0
+ react 19.2.1
+ react-day-picker 9.11.1
+ react-dom 19.2.1
+ react-hook-form 7.64.0
+ react-resizable-panels 3.0.6
+ recharts 2.15.4
+ resend 6.12.2
+ sonner 2.0.7
+ streamdown 1.4.0
+ stripe 22.1.0
+ superjson 1.13.3
+ tailwind-merge 3.3.1
+ tailwindcss-animate 1.0.7
+ uuid 14.0.0
+ vaul 1.1.2
+ wouter 3.7.1
+ zod 4.1.12

devDependencies:
+ @builder.io/vite-plugin-jsx-loc 0.1.1
+ @tailwindcss/typography 0.5.19
+ @tailwindcss/vite 4.1.14
+ @types/bcryptjs 3.0.0
+ @types/better-sqlite3 7.6.13
+ @types/express 4.17.21
+ @types/google.maps 3.58.1
+ @types/jsonwebtoken 9.0.10
+ @types/node 24.7.0
+ @types/react 19.2.1
+ @types/react-dom 19.2.1
+ @vitejs/plugin-react 5.0.4
+ add 2.0.6
+ autoprefixer 10.4.21
+ drizzle-kit 0.31.10
+ esbuild 0.25.10
+ playwright 1.60.0
+ pnpm 10.18.1
+ postcss 8.5.6
+ prettier 3.6.2
+ tailwindcss 4.1.14
+ tsx 4.20.6
+ tw-animate-css 1.4.0
+ typescript 5.9.3
+ vite 7.1.9
+ vite-plugin-manus-runtime 0.0.57
+ vitest 2.1.9

╭ Warning ─────────────────────────────────────────────────────────────────────╮│                                                                              ││   Ignored build scripts: better-sqlite3.                                     ││   Run "pnpm approve-builds" to pick which dependencies should be allowed     ││   to run scripts.                                                            ││                                                                              │╰──────────────────────────────────────────────────────────────────────────────╯

Done in 6.4s using pnpm v10.4.1
```

## Check output (tail)

```text

> prime-contractor-os@1.0.0 check /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> tsc --noEmit

```

## Test output (tail)

```text
[31m[1mSerialized Error:[22m[39m [90m{ errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯[22m[39m

[31m[1m[7m FAIL [27m[22m[39m server/guidance.test.ts[2m > [22mGuidanceEngine[2m > [22mRationale Field[2m > [22mshould optionally include rationale for actions
[31m[1mError[22m: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?
params: 1[39m
[90m [2m❯[22m MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:[2m79:11[22m[39m
[90m [2m❯[22m MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:[2m132:18[22m[39m
[36m [2m❯[22m GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:[2m44:111[22m[39m
    [90m 42| [39m
    [90m 43| [39m    [90m// Get workspace data[39m
    [90m 44| [39m    [35mconst[39m [oppCount[33m,[39m propCount[33m,[39m contractCount[33m,[39m taskCount[33m,[39m invoiceCount…
    [90m   | [39m                                                                                                              [31m^[39m
    [90m 45| [39m      db[33m.[39m[34mselect[39m({ count[33m:[39m opportunities[33m.[39mid })[33m.[39m[35mfrom[39m(opportunities)[33m.[39m[34mwhere[39m…
    [90m 46| [39m      db[33m.[39m[34mselect[39m({ count[33m:[39m proposals[33m.[39mid })[33m.[39m[35mfrom[39m(proposals)[33m.[39m[34mwhere[39m([34meq[39m(prop…
[90m [2m❯[22m server/guidance.test.ts:[2m141:23[22m[39m

[31m[1mCaused by: Error[22m: connect ECONNREFUSED 127.0.0.1:3306[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:[2m133:24[22m[39m
[90m [2m❯[22m MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:[2m77:18[22m[39m
[90m [2m❯[22m MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:[2m132:29[22m[39m
[90m [2m❯[22m MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:[2m1145:25[22m[39m
[90m [2m❯[22m MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:[2m31:15[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22m[39m
[31m[1mSerialized Error:[22m[39m [90m{ errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯[22m[39m

[31m[1m[7m FAIL [27m[22m[39m server/resend.test.ts[2m > [22mResend Email Service[2m > [22mshould return empty string for resendApiKey when env var is not set
[31m[1mAssertionError[22m: expected '[REDACTED_TOKEN]' to be '' // Object.is equality[39m

[32m- Expected[39m
[31m+ Received[39m

[31m+ [REDACTED_TOKEN][39m

[36m [2m❯[22m server/resend.test.ts:[2m62:30[22m[39m
    [90m 60| [39m    [35mconst[39m { [33mENV[39m } [33m=[39m [35mawait[39m [35mimport[39m([32m"./_core/env"[39m)[33m;[39m
    [90m 61| [39m    [90m// In test environment, RESEND_API_KEY is not set, so ENV.resendAp[39m…
    [90m 62| [39m    [34mexpect[39m([33mENV[39m[33m.[39mresendApiKey)[33m.[39m[34mtoBe[39m([32m""[39m)[33m;[39m
    [90m   | [39m                             [31m^[39m
    [90m 63| [39m  })[33m;[39m
    [90m 64| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯[22m[39m

[2m Test Files [22m [1m[31m2 failed[39m[22m[2m | [22m[1m[32m11 passed[39m[22m[90m (13)[39m
[2m      Tests [22m [1m[31m13 failed[39m[22m[2m | [22m[1m[32m90 passed[39m[22m[90m (103)[39m
[2m   Start at [22m 19:20:05
[2m   Duration [22m 5.08s[2m (transform 1.29s, setup 0ms, collect 5.60s, tests 6.05s, environment 2ms, prepare 994ms)[22m


::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > analyzeWorkspace > should return an array of NextAction objects,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:41:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > analyzeWorkspace > should return actions with required fields,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:46:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > analyzeWorkspace > should return actions with valid priority levels,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:59:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > analyzeWorkspace > should suggest creating first opportunity when workspace is empty,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:67:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > getNextBestAction > should return a single NextAction or null,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ GuidanceEngine.getNextBestAction server/services/guidanceEngine.ts:206:21%0A ❯ server/guidance.test.ts:77:22%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > getNextBestAction > should return the highest priority action when multiple exist,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ GuidanceEngine.getNextBestAction server/services/guidanceEngine.ts:206:21%0A ❯ server/guidance.test.ts:86:22%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Action Categories > should include opportunity category actions,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:100:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Action Categories > should include compliance category actions,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:106:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Action Categories > should include team category actions,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:112:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Action Types > should return actions with valid action types,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:120:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Estimated Minutes > should have reasonable estimated minutes for each action,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:130:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/services/guidanceEngine.ts,title=server/guidance.test.ts > GuidanceEngine > Rationale Field > should optionally include rationale for actions,line=44,column=111::Error: Failed query: select `id` from `opportunities` where `opportunities`.`workspaceId` = ?%0Aparams: 1%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:79:11%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:18%0A ❯ GuidanceEngine.analyzeWorkspace server/services/guidanceEngine.ts:44:111%0A ❯ server/guidance.test.ts:141:23%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { query: 'select `id` from `opportunities` where `opportunities`.`workspaceId` = ?', params: [ 1 ] }%0ACaused by: Caused by: Error: connect ECONNREFUSED 127.0.0.1:3306%0A ❯ node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:133:24%0A ❯ MySql2PreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/session.ts:77:18%0A ❯ MySql2PreparedQuery.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql2/session.ts:132:29%0A ❯ MySqlSelectBase.execute node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/mysql-core/query-builders/select.ts:1145:25%0A ❯ MySqlSelectBase.then node_modules/.pnpm/drizzle-orm@0.44.7_@types+better-sqlite3@7.6.13_better-sqlite3@12.9.0_mysql2@3.22.3_@types+node@24.7.0_/node_modules/src/query-promise.ts:31:15%0A%0A⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯%0ASerialized Error: { errno: -111, code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 3306, fatal: true }%0A

::error file=/home/runner/work/-primecontractoros-v2/-primecontractoros-v2/server/resend.test.ts,title=server/resend.test.ts > Resend Email Service > should return empty string for resendApiKey when env var is not set,line=62,column=30::AssertionError: expected '[REDACTED_TOKEN]' to be '' // Object.is equality%0A%0A- Expected%0A+ Received%0A%0A+ [REDACTED_TOKEN]%0A%0A ❯ server/resend.test.ts:62:30%0A%0A
(node:2202) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unhandledRejection listeners added to [process]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
(Use `node --trace-warnings ...` to show where the warning was created)
 ELIFECYCLE  Test failed. See above for more details.
```

## Build output (tail)

```text

> prime-contractor-os@1.0.0 build /home/runner/work/-primecontractoros-v2/-primecontractoros-v2
> vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

[36mvite v7.1.9 [32mbuilding for production...[36m[39m
[33m[1m(!) %VITE_ANALYTICS_ENDPOINT% is not defined in env variables found in /index.html. Is the variable mistyped?[22m[39m
[33m[1m(!) %VITE_ANALYTICS_WEBSITE_ID% is not defined in env variables found in /index.html. Is the variable mistyped?[22m[39m
<script src="%VITE_ANALYTICS_ENDPOINT%/umami"> in "/index.html" can't be bundled without type="module" attribute
transforming...
[32m✓[39m 1941 modules transformed.
rendering chunks...
computing gzip size...
[2m../dist/public/[22m[32mindex.html                 [39m[1m[2m  368.37 kB[22m[1m[22m[2m │ gzip: 105.76 kB[22m
[2m../dist/public/[22m[2massets/[22m[35mindex-CuhRRp3a.css  [39m[1m[2m  160.80 kB[22m[1m[22m[2m │ gzip:  25.07 kB[22m
[2m../dist/public/[22m[2massets/[22m[36mindex-BK0GVjdB.js   [39m[1m[33m2,688.00 kB[39m[22m[2m │ gzip: 540.29 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 4.79s[39m

  dist/index.js  840.2kb

⚡ Done in 27ms
```
