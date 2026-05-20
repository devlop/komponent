'use strict';

interface KomponentFactoryInterface
{
    (selector : string, callback : Function) : void;

    refresh(root? : Element) : void;
};

export default KomponentFactoryInterface;
