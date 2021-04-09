// @flow 
import { Button, Grid, makeStyles, MenuItem, Select } from '@material-ui/core';
import { Loader } from 'google-maps';
import React, { FormEvent, useCallback, useRef } from 'react';
import {useState, useEffect} from 'react';
import { getCurrentPosition } from '../util/geolocation';
import { makeCarIcon, makeMarkerIcon, Mapa } from '../util/maps';
import { Route } from '../util/models';
import {sample, shuffle} from "lodash";
import { RouteExistsError } from '../errors/route-exists.error';
import { useSnackbar } from 'notistack';
import { Navbar } from './Navbar';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL as string;

const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
    "#b71c1c",
    "#4a148c",
    "#2e7d32",
    "#e65100",
    "#2962ff",
    "#c2185b",
    "#FFCD00",
    "#3e2723",
    "#03a9f4",
    "#827717",
  ];
  
  const useStyles = makeStyles({
    root: {
      width: "100%",
      height: "100%",
    },
    form: {
      margin: "16px",
    },
    btnSubmitWrapper: {
      textAlign: "center",
      marginTop: "8px",
    },
    map: {
      width: "100%",
      height: "100%",
    },
  });

export const Mapping: React.FunctionComponent = (props) => {
    const classes = useStyles();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [routeIdSelected, setrouteIdSelected] = useState<string>("");
    const mapRef = useRef<Mapa>();
    const socketIORef = useRef<SocketIOClient.Socket>();
    const {enqueueSnackbar} = useSnackbar();

    const finishRoute = useCallback(
        (route: Route) => {
          enqueueSnackbar(`${route.title} finalizou!`, {
            variant: "success",
          });
          mapRef.current?.removeRoute(route._id);
        },
        [enqueueSnackbar]
      );

    useEffect(() => {
        if (!socketIORef.current?.connected) {
            socketIORef.current = io.connect(API_URL) as SocketIOClient.Socket;
            socketIORef.current.on("connect", () => console.log("conectou"));         
        }
        const handler = (data:{
            routeId: string; 
            position: [number, number], 
            finished: boolean
        }) => {
            mapRef.current?.moveCurrentMaker(data.routeId, {
                lat: data.position[0],
                lng: data.position[1],
            });
            const route = routes.find((route) => route._id === data.routeId) as Route;
            if (data.finished){
                finishRoute(route);
            }
        }
        socketIORef.current?.on(
            'new-position', handler
        );    
        return () => {
            socketIORef.current?.off('new-position', handler)
        }      
    }, [finishRoute, routes, routeIdSelected]);

    useEffect(() => {
        fetch(`${API_URL}/routes`)
            .then((data) => data.json())
            .then((data) => setRoutes(data))    
    }, []);

    useEffect(() => {
        (async () => {
            const [, position] = await Promise.all([
                await googleMapsLoader.load(),
                getCurrentPosition({enableHighAccuracy: true})
            ]);
            const divMap = document.getElementById('map') as HTMLElement;
            mapRef.current = new Mapa(divMap, {
                zoom: 15,
                center: position,
            });
        })();
    }, []);


    const startRoute = useCallback(
        (event: FormEvent) => {
            event?.preventDefault();
            const route = routes.find((route) => route._id === routeIdSelected);
            const color = sample(shuffle(colors)) as string;
            try{
                mapRef.current?.addRoute(routeIdSelected, {
                    currentMarkerOptions: {
                        position: route?.startPosition as any,
                        icon: makeCarIcon(color),
                    },
                    endMarkerOptions: {
                        position: route?.endPosition as any,
                        icon: makeMarkerIcon(color),
                    },
                });   
                socketIORef.current?.emit('new-direction',{
                    routeId: routeIdSelected
                })
            } catch (error) {
                if (error instanceof RouteExistsError) {
                  enqueueSnackbar(`${route?.title} já adicionado, espere finalizar.`, {
                    variant: "error",
                  });
                  return;
                }
                throw error;
            }
    }, [routeIdSelected, routes, enqueueSnackbar]);

    return (
        <Grid className={classes.root} container>
            <Grid item xs={12} sm={3}>
                <Navbar/>
                <form onSubmit={startRoute} className={classes.form} >
                    <Select 
                        fullWidth
                        displayEmpty
                        value={routeIdSelected}
                        onChange={(event) => setrouteIdSelected(event.target.value + "")}
                    >
                        <MenuItem value="">
                            <em>Selecione a corrida</em>    
                        </MenuItem>
                        {routes.map((route, key) => (
                             <MenuItem key={key} value={route._id}>
                                {route.title}  
                            </MenuItem> 
                        ))}
                    </Select>
                    <div className={classes.btnSubmitWrapper}>
                        <Button type='submit' color="primary" variant='contained'>Iniciar Corrida</Button>
                    </div>
                </form>
            </Grid>
            <Grid item xs={12} sm={9}>
                <div id="map" className={classes.map}></div>
            </Grid>
        </Grid>        
    )
};