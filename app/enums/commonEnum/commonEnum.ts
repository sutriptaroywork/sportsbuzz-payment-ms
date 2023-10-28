export enum StatusCodeEnums {
  OK = 200,
  CREATE = 201,
  DELETED = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  NOT_ACCEPTABLE = 406,
  EXPECTATION_FAILED = 417,
  LOCKED = 423,
  CONFLICT = "409",
  INTERNAL_SERVER_ERROR = 500,
  UNPROCESSABLE_ENTITY = 422,
  RESOURCE_EXISTS = 409,
  TOO_MANY_REQUEST = 429,
  REDIRECT = 302,
}

export enum promoCodeStats {
  Y = "Y",
  N = "N",
}
export enum statusEnums {
  Y = "Y",
  N = "N",
}

export enum languageEnums {
  ENGLISH = "English",
  HINDI = "Hindi",
}
export enum encodingAndEncryption {
  SHA_256 = "sha256",
  BASE_64 = "base64",
}
export enum messagesEnglish {
  error = "Something went wrong.",
  error_with = "Something went wrong with ##.",
  cAmount = "Amount",
  reg_success = "Welcome! You are registered successfully.",
  cvalidationSetting = "Validation setting",
  cDepositHasBeenMade = "Deposit has been made",
  processDepositPayment = "Pending Deposit Payment Processed",
  deposit_success = "You'r account has been successfully credited.",
  cpaymentOption = "PaymentOption",
  tdsDeduction = "TDS Deduction",
  cPlatformHeaders = "Platform in headers is",
  cDeposit = "Deposit",
  cCounts = "Counts",
  unable_to_remove_beneficiary = "Unable to remove beneficiary",
  cresponseGet = "Response get",
  cpaymentOptions = "PaymentOptions",
  cCashFreePaymentToken = "Cashfree Payment Token",
  cCashFreePaymentLink = "Cashfree Payment Link",
  cbonusExpirySetting = "Bonus Expiry setting",
  cprocessedDeposit = "Deposit processed",
  depo_already_process = "Deposit already process",
  date_filter_err = "Please select date range for export data.",
  cAmazonPaymentToken = "Amazon Payment Token",
  cPaymentGateway = "Payment Gateway",
  cAmazonPaymentLink = "Amazon Payment Link",
  processInitiatePayout = "Initiated Withdraw Payout Processed",
  promo_amount_err = 'This promocode is only available for deposit amount between ₹# to ₹##.',
  deposit_amount = "You must add ## rupees to purchase the tickets",
  depositRequest = "Deposit request",
  already_assigned = "## is already assigned to a user, and cannot be reassigned",
  insuff_balance = "Insufficient balance for ##",
  pending_withdrawal_exists = "There is already a pending withdrawal",
  success = "## fetched successfully.",
  successfully = "## successfully.",
  action_success = "##  successful.",
  action_failure = "##  failed.",
  passbook = "Passbook entry",
  generate_success = "## generated successfully.",
  gstBreakup = 'GST breakup',
  gst_calculate_error = " Please calculate user gst properly",
  add_success = "## added successfully.",
  update_success = "## updated successfully.",
  del_success = "## deleted successfully.",
  submit_success = "## submitted successfully.",
  cBackgroundProcess = "## Background process started",
  presigned_succ = "Pre-signed URL generated successfully.",
  ctransactions = "Transactions",
  cpayoutOption = "PayoutOption",
  cpayoutOptions = "PayoutOptions",
  cpayoutOptionDetails = "PayoutOption details",
  cpaymentOptionDetails = "PaymentOption details",
  cGenerationProcess = "## Creation process started",
  creport = "Report",
  snewPaymentOption = "New Payment option",
  cBalance = "Balance",
  image = "Image",
  invalid_signature = "Signature is invalid.",
  fields_missing = "## missing",
  fail = "Failed",
  withdraw_on_hold = "Only pending transactions can be put on hold",
  processWithdraw = "Withdraw processed",
  reject_status_invalid = "Cannot rollback a successful withdrawal",
  fill_bankdetails_err = "Fill user bank details !!",
  route_not_found = "Page Not Found.",
  team_not_created = "You have not created any team of super user. Please create a team on this Match",
  withdraw_request_success = "Your withdrawal request was submitted successfully. Amount will be credited to your account once approved.",
  fix_len_err = "## must be # character long.",
  required = "## is required.",
  invalid = "## is invalid.",
  internal_user = "Internal user",
  order_already_processed = "Order already processed",
  wait_for_proccessing = "Please wait for a while we are already processing this ## request",
  withdraw_process_err = "This withdraw process already completed",
  error_payout_balance_check = "Error while checking balance in cashfree payouts is ##.",
  error_payout_fetchOrAdd_Beneficiary = "Error while fetching or adding beneficiary details in cashfree payouts is ##.",
  invalid_promo_err = "Entered promocode is either expired or inactive.",
  promocode_unavailable = "This promocode is only available for deposit amount between ₹min_amount to ₹max_amount.",
  promocode_expired = "Oops! promocode has expired",
  min_err = "## amount should be ₹# or higher.",
  max_err = "## amount should be ₹# or less.",
  valid = "## is valid.",
  cTds = "TDS",
  cpassbook = "Passbook",
  already_exist = "## is already exist.",
  duplicate_team = "duplicate ## were sent.", // This is when the aUserTeamId has same duplicate key.
  already_added = "## is already Added.",
  not_exist = "## is not exist.",
  tdsBreakup = "TDS breakup",
  tds_calculate_error = "Please calculate the user's tds properly.",
  user_not_found = "User not found with given mobile number.",
  not_found = "## not found",
  err_unauthorized = "Authentication failed. Please login again!",
  user_blocked = "You are blocked by our system. Contact administrator for more details.",
  err_otp_expired = "OTP is no longer valid, Please try again.",
  success_logout = "You have successfully logged out!",
  success_login = "Welcome Back! You have logged in successfully.",
  went_wrong_with = "Something went wrong with ##",
  presigned_success = "Pre-signed URL generated successfully.",
  must_alpha_num = "Username allows alphanumeric characters only.",
  auth_failed = "Please enter a valid credentials.",
  err_resend_otp = "You can resend OTP only after ## seconds.",
  old_new_password_same = "Old and New password can't be same.",
  wrong_old_password = "Please enter a correct old password.",
  user_forgot_err = "We didn't find any account in our system. Please check your input first.",
  OTP_sent_success = "OTP sent successfully.",
  verify_otp_err = "Entered OTP is invalid or expired.",
  verification_success = "Verification done successfully.",
  no_match_scheduled = "No Matches scheduled for this date.",
  no_lineups = "Playing 11 are not scheduled.",
  block_user_err = "This user is blocked by admin. Please contact to administrator for further assistance.",
  reset_pass_success = "Your password has been reset successfully. Please login using new password.",
  forgot_link_err = "Link is expired or invalid. Please try again or contact to administrator for further assistance.",
  already_verified = "## is already verified.",
  match_not_started = "Match is not started.",
  kyc_under_review = "Your KYC is currently under review. Please contact administrator if you need any assistance.",
  kyc_not_approved = "Your KYC has not yet been approved.",
  reject_reason_required = "Reject reason required",
  reject_reason_invalid = "Invalid reject reason",
  pancard_not_approved = "Your Pancard is not approved.",
  aadharcard_not_approved = "Your Aadharcard is not approved.",
  limit_reached = "You have reached a limit for sending ##. Please try after some time.",
  err_bank_update = "You can update bank details only once. Contact to administrator for change request.",
  link_expire_invalid = "This link seems to be expired or invalid. Please try again.",
  kyc_status_v_err = "You can't verify this document.",
  less_then_err = "## should be less then #.",
  less_then_eq_err = "## should be less then or equal to #.",
  greater_then_err = "## should be greater then #.",
  fixed_size_err = "## should be only #.",
  same_value_err = "## and # can't be same.",
  unique_team_player_err = "All team players should be unique",
  error_payout_process = "Error while processing cashfree payouts money request transfer is ##.",
  cBotSubmitBackgroundProcess = "Bot Submission Background process started",
  match_started = "Match already started.",
  league_full = "League is already full.",
  user_already_joined = "You have already joined the league with this team.",
  multiple_join_err = "You can't join the league with multiple teams.",
  team_join_limit_err = "You have reached a limit for team join.",
  match_not_complete = "Match is not completed.",
  not_selected = "## are not selected.",
  possible_combination = "Possible combinations are ##",
  max_possible_combination = "Maximum Possible combinations are ##",
  mob_verify_err = "Mobile number is not verified. Please verify it first.",
  league_join_err = "You can't join the this league.",
  insufficient_balance = "Insufficient balance for ##",
  image_not_required = "## is not required",
  invalid_payout = "This withdraw method not available.",
  contest_past_date_err = "Contest date should be a future date.",
  contest_rp_ac = "Ready to play contest will always auto create.",
  wp_percentage_err = "Total of winning pattern percentage should be 100%.",
  past_date_err = "## date should be a future date.",
  compiled_success = "File compiled successfully.",
  upload_excel_file = "Please upload a excel file",
  access_denied = "You don't have permission",
  already_started = "## already started.",
  bonus = "Bonus",
  cTeam = "Team",
  MATCH = "Match",
  MATCH_LEAGUE = "Match league",
  cJoinLeague = "Join league",
  cProcess = "Process",
  bBotCreate = "bBotCreate",
  nMinTeamCount = "nMinTeamCount",
  nContestMaxSize = "contest max size",
  reschedule_limit_reached = "## reschedule maximum limit reached.",
  user = "User",
  captain = "Captain",
  viceCaptain = "Vice Captain",
  cWithdrawRequest = "Withdraw request",
  withdraw = "Withdraw",
  withdraw_not_permited = "## can not withdraw amount",
  cancel_success = "## cancel successful.",
  sports_err = "This sports is not available.",
  players = "Players",
  max_team_player_err = "You can select maximum ## player from a team.",
  roles = "Roles",
  Credit = "Credit",
  teamName = "Team Name",
  team = "Team",
  newUserTeam = "New UserTeam",
  userJoined = "User joined",
  joinLeague2 = "Join League 2",
  systemUser = "System User",
  public_league_join_err = "You can't join the public leagues.",
  join_contest_success = "Contest joined successfully.",
  join_contest_failure = "Couldn't join the contest successfully.",
}

export enum miscellaneous {
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  cronInterval = "*/2 * * * *",
}

export enum dbCache {
  CACHE_1 = 10, // 10 seconds
  CACHE_2 = 60, // 1 minute
  CACHE_3 = 3600, // 1 hour
  CACHE_4 = 86400, // 1 day
  CACHE_5 = 864000, // 10 days
  CACHE_6 = 21600, // 6 Hours
  CACHE_7 = 300, // 5 minute
  CACHE_8 = 600, // 10 minute
  CACHE_9 = 5, // 5 seconds,
  CACHE_10 = 1800, // 30 minute
}