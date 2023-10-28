export interface UserLeagueNotFound {
  data: UserLeagueJoin;
}

interface UserLeagueJoin {
  sKey: string;
  oValue: {
    nJoinSuccess: number;
    nTotalTeam: number;
    bRefreshLeague?: boolean;
  };
}
