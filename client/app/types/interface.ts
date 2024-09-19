interface State {
    user: { name: string; email: string; profilePicture: string };
    isLoading: boolean;
    activeTab: string;
    isSidebarOpen: boolean;
    isChangePasswordModalVisible: boolean;
  }

interface SetUserAction {
    type: 'SET_USER';
    payload: { name: string; email: string; profilePicture: string };
  }
  
  interface SetLoadingAction {
    type: 'SET_LOADING';
    payload: boolean;
  }
  
  interface SetActiveTabAction {
    type: 'SET_ACTIVE_TAB';
    payload: string;
  }
  
  interface ToggleSidebarAction {
    type: 'TOGGLE_SIDEBAR';
  }
  
  interface ToggleChangePasswordModalAction {
    type: 'TOGGLE_CHANGE_PASSWORD_MODAL';
  }
  
  type Action =
    | SetUserAction
    | SetLoadingAction
    | SetActiveTabAction
    | ToggleSidebarAction
    | ToggleChangePasswordModalAction;

    
interface ChangePasswordValues {
    currentPassword: string;
    newPassword: string;
}