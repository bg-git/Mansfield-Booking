import {
  NavLink as RouterLink,
  matchPath,
  useLocation
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';

const NavItem = ({
  href,
  icon: Icon,
  title,
  textColor,
  activeTextColor,
  ...rest
}) => {
  const location = useLocation();

  const active = href ? !!matchPath({
    path: href,
    end: false
  }, location.pathname) : false;

  return (
    <ListItem
      disableGutters
      sx={{
        display: 'flex',
        py: 0
      }}
      {...rest}
    >
      <Button
        component={RouterLink}
        sx={{
          color: 'text.secondary',
          fontWeight: 'normal',
          justifyContent: 'flex-start',
          letterSpacing: 0,
          textTransform: 'none',
          color: textColor,
          width: '100%',
          ...(active && {
            color: activeTextColor,
            fontWeight: 'bold'
          }),
          '& svg': {
            mr: 1
          }
        }}
        className={`${active ? 'active' : 'in-active'}`}
        to={href}
      >
        {Icon && (
          <Icon size="20" />
        )}
        <span>
          {title}
        </span>
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.elementType,
  title: PropTypes.string,
  textColor: PropTypes.string,
  activeTextColor: PropTypes.string
};

export default NavItem;
