export default function NotFound() {
  return (
    <div className="alert alert-danger centered-alert" role="alert">
      <div className="d-flex gap-2">
        <span><i className="fa-solid fa-circle-exclamation icon-danger"></i></span>
        <div className="d-flex flex-column">
          <h6 className="mb-1">This account has been permanently deleted</h6>
          <p className="mb-0">The user `IanAtlas` no longer has access to Atlassian services.</p>
        </div>
      </div>
    </div>
  );
}
