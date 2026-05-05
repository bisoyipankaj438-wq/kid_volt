import { useEffect, useState, useCallback } from "react";
import { loadState, saveState, type KidVoltState } from "@/lib/store";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const FAMILY_ID_KEY = "kidvolt:familyId";
function getFamilyId() {
  if (typeof window === "undefined") return "default";
  let id = localStorage.getItem(FAMILY_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(FAMILY_ID_KEY, id);
  }
  return id;
}

export function useKidVolt() {
  const [state, setState] = useState<KidVoltState>(() => loadState());
  const familyId = getFamilyId();

  const remoteState = useQuery(api.state.get, { id: familyId });
  const saveRemote = useMutation(api.state.save);

  useEffect(() => {
    if (remoteState === null) {
      // No remote state yet, let's push our local state
      saveRemote({ id: familyId, data: loadState() }).catch(console.error);
    } else if (remoteState && remoteState.data) {
      const remoteData = remoteState.data as KidVoltState;
      setState(remoteData);
      saveState(remoteData);
    }
  }, [remoteState, familyId, saveRemote]);

  useEffect(() => {
    const sync = () => setState(loadState());
    window.addEventListener("kidvolt:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kidvolt:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback(
    (updater: (s: KidVoltState) => KidVoltState) => {
      const currentState = loadState();
      const nextState = updater(currentState);
      saveState(nextState);
      setState(nextState);

      saveRemote({ id: familyId, data: nextState }).catch((err) => {
        console.error("Failed to sync to Convex:", err);
      });
    },
    [familyId, saveRemote],
  );

  return { state, update };
}
