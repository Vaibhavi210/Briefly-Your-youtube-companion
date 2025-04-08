import React from 'react'
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
   
   
<nav class="navbar navbar-expand-lg navbar-scroll fixed-top shadow-0 border-bottom border-dark" data-mdb-navbar-init>
  <div class="container">
    <Link class="navbar-brand" to="/">YouTube Summerizer<i class="fab fa-mdb fa-4x"></i></Link>
    
    
    <form className="form-inline my-2 my-lg-0">
          <Link to="/signup" className="btn btn-outline-success me-3 my-2 my-sm-0">
            Sign Up
          </Link>
          <Link to="/signup" className="btn btn-outline-success my-2 my-sm-0">
            Login
          </Link>
        </form>
   
  </div>
</nav>



    
  )
}
